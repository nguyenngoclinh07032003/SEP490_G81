import bcrypt from 'bcrypt';
import redisClient from '../config/redis.js';
import tokenService from './token.service.js';
import { userRepository } from '../repositories/index.js';

// Cấu hình giới hạn đăng nhập sai theo JOB-01
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 15 * 60; // 15 phút (900 giây)

/**
 * ==============================================================================
 * DỊCH VỤ MINH ĐỨC - AUTH SERVICE (TẦNG NGHIỆP VỤ XÁC THỰC)
 * ==============================================================================
 * Nguyên tắc thiết kế:
 * - Tầng Service CHỈ chứa nghiệp vụ tính toán, xác thực logic và điều phối
 * - Toàn bộ SQL Query và Database Access được ủy quyền cho UserRepository
 */
class AuthService {
  /**
   * Chuẩn hóa chuỗi identifier (username / email) bằng cách xóa khoảng trắng và chuyển chữ thường
   */
  normalize(str) {
    if (!str || typeof str !== 'string') return '';
    return str.trim().toLowerCase();
  }

  /**
   * Đăng nhập hệ thống
   * - Hỗ trợ identifier linh hoạt: email, username hoặc identifier
   * - Tích hợp Redis đếm số lần sai và tự động khóa 15 phút
   * - Gọi UserRepository để tra cứu thông tin người dùng
   * - Sinh Access Token JWT và Opaque Hashed Refresh Token
   */
  async login({ username, identifier: rawId, email, password }) {
    const rawIdentifier = email || username || rawId;
    if (!rawIdentifier || !password) {
      const error = new Error('Vui lòng cung cấp tên đăng nhập/email và mật khẩu.');
      error.status = 400;
      error.code = 'REQUIRED_FIELDS_MISSING';
      throw error;
    }

    const identifier = this.normalize(rawIdentifier);

    // 1. Kiểm tra khóa tài khoản trong Redis (Chống Brute-Force theo JOB-01)
    try {
      const isLocked = await redisClient.get(`lockout:${identifier}`);
      if (isLocked) {
        const ttl = await redisClient.ttl(`lockout:${identifier}`);
        const minutesLeft = Math.ceil(ttl / 60);
        const error = new Error(`Tài khoản đang bị tạm khóa do nhập sai mật khẩu quá ${MAX_LOGIN_ATTEMPTS} lần. Vui lòng thử lại sau ${minutesLeft} phút.`);
        error.status = 429;
        error.code = 'ACCOUNT_LOCKED';
        throw error;
      }
    } catch (redisErr) {
      if (redisErr.status === 429) throw redisErr;
      console.warn('⚠️ [Redis] Bỏ qua kiểm tra lockout:', redisErr.message);
    }

    // 2. Tìm tài khoản trong database thông qua UserRepository
    const user = await userRepository.findByIdentifierForAuth(identifier);

    // Hàm phụ trợ ghi nhận đăng nhập thất bại vào Redis
    const recordFailedAttempt = async () => {
      try {
        const attempts = await redisClient.incr(`attempts:${identifier}`);
        if (attempts === 1) {
          await redisClient.expire(`attempts:${identifier}`, LOCKOUT_DURATION_SECONDS);
        }
        if (attempts >= MAX_LOGIN_ATTEMPTS) {
          await redisClient.set(`lockout:${identifier}`, 'locked', { EX: LOCKOUT_DURATION_SECONDS });
          await redisClient.del(`attempts:${identifier}`);
        }
        return attempts;
      } catch (e) {
        return 0;
      }
    };

    if (!user) {
      await recordFailedAttempt();
      const error = new Error('Tên đăng nhập hoặc mật khẩu không chính xác.');
      error.status = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // 3. Kiểm tra trạng thái tài khoản (ACTIVE, INACTIVE, LOCKED)
    if (user.account_status !== 'ACTIVE') {
      const error = new Error(`Tài khoản của bạn đang ở trạng thái '${user.account_status}'. Vui lòng liên hệ quản trị viên.`);
      error.status = 403;
      error.code = 'ACCOUNT_DISABLED';
      throw error;
    }

    // 4. So khớp mật khẩu đã băm (Bcrypt)
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      const attempts = await recordFailedAttempt();
      const remainingAttempts = Math.max(0, MAX_LOGIN_ATTEMPTS - attempts);
      const error = new Error(
        remainingAttempts > 0
          ? `Mật khẩu không chính xác. Bạn còn ${remainingAttempts} lần thử trước khi bị tạm khóa.`
          : `Đã nhập sai quá ${MAX_LOGIN_ATTEMPTS} lần liên tiếp. Tài khoản bị tạm khóa 15 phút.`,
      );
      error.status = 401;
      error.code = 'PASSWORD_INCORRECT';
      throw error;
    }

    // 5. Đăng nhập thành công -> Xóa bộ đếm sai trong Redis
    try {
      await redisClient.del(`attempts:${identifier}`);
      await redisClient.del(`lockout:${identifier}`);
    } catch (e) {
      // bỏ qua lỗi redis
    }

    // 6. Truy vấn danh sách quyền chi tiết (Permissions) từ RBAC qua UserRepository
    const permissions = await userRepository.getPermissionsByRoleId(user.role_id);

    // 7. Cấp cặp Token bảo mật (Access Token 15m + Opaque Hashed Refresh Token 7d)
    const { accessToken, refreshToken, expiresIn } = tokenService.generateTokens(user);

    // Lưu session vào Redis
    await tokenService.saveSession(user.user_id, refreshToken);

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        avatar: user.ava_storage_reference,
        role: user.role_code,
        roleName: user.role_name,
      },
      permissions,
    };
  }

  /**
   * Đăng ký tài khoản mới
   * - Chấp nhận fullName hoặc full_name linh hoạt
   * - Tự động gán role 'CUSTOMER' server-side
   * - Giao phó Transaction tạo bảng cho UserRepository
   * - Không trả về password_hash
   */
  async register({ username, password, fullName, full_name, phone, email }) {
    const rawFullName = fullName || full_name;
    if (!username || !password || !rawFullName || !phone) {
      const error = new Error('Vui lòng cung cấp đầy đủ: Tên đăng nhập, Mật khẩu, Họ tên và Số điện thoại.');
      error.status = 400;
      error.code = 'REQUIRED_FIELDS_MISSING';
      throw error;
    }

    const cleanUsername = this.normalize(username);
    const cleanEmail = email ? this.normalize(email) : null;

    // Kiểm tra ràng buộc: Username không được chứa dấu @
    if (cleanUsername.includes('@')) {
      const error = new Error('Tên đăng nhập không được chứa ký tự @. Để sử dụng email, vui lòng điền vào ô Email.');
      error.status = 400;
      error.code = 'INVALID_USERNAME_FORMAT';
      throw error;
    }

    // Kiểm tra định dạng Email nếu người dùng có nhập
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      const error = new Error('Định dạng email không hợp lệ (ví dụ hợp lệ: example@gmail.com).');
      error.status = 400;
      error.code = 'INVALID_EMAIL_FORMAT';
      throw error;
    }

    if (password.length < 6) {
      const error = new Error('Mật khẩu phải chứa ít nhất 6 ký tự.');
      error.status = 400;
      error.code = 'PASSWORD_TOO_SHORT';
      throw error;
    }

    // 1. Kiểm tra trùng lặp qua UserRepository
    const duplicate = await userRepository.checkDuplicate(cleanUsername, cleanEmail);
    if (duplicate) {
      const error = new Error('Tên đăng nhập hoặc Email này đã được sử dụng.');
      error.status = 409;
      error.code = 'USER_ALREADY_EXISTS';
      throw error;
    }

    // 2. Lấy role_id cho vai trò CUSTOMER qua UserRepository
    const roleId = await userRepository.getRoleIdByCode('CUSTOMER');
    if (!roleId) {
      const error = new Error("Hệ thống chưa thiết lập vai trò 'CUSTOMER'.");
      error.status = 500;
      error.code = 'SYSTEM_CONFIG_ERROR';
      throw error;
    }

    // 3. Băm mật khẩu (Bcrypt)
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Tạo người dùng qua Transaction trong UserRepository
    return await userRepository.createCustomerUserTransaction({
      roleId,
      username: cleanUsername,
      passwordHash,
      email: cleanEmail,
      fullName: rawFullName,
      phone,
    });
  }

  /**
   * Cấp lại Access Token (15 phút) thông qua Opaque Refresh Token
   */
  async refreshToken({ refreshToken, oldAccessToken }) {
    if (!refreshToken) {
      const error = new Error('Thiếu Refresh Token.');
      error.status = 400;
      error.code = 'REFRESH_TOKEN_REQUIRED';
      throw error;
    }

    // 1. Xác thực Refresh Token và phiên làm việc
    const decoded = await tokenService.verifyRefreshToken(refreshToken);
    const userId = decoded.userId;

    // 2. Đưa Access Token cũ vào Blacklist
    if (oldAccessToken) {
      await tokenService.blacklistToken(oldAccessToken);
    }

    // 3. Kiểm tra user trong DB qua UserRepository
    const user = await userRepository.findAccountStatusById(userId);
    if (!user || user.account_status !== 'ACTIVE') {
      const error = new Error('Tài khoản không tồn tại hoặc đã bị khóa.');
      error.status = 403;
      error.code = 'ACCOUNT_DISABLED';
      throw error;
    }

    // 4. Token Rotation: Thu hồi Refresh Token cũ và tạo cặp Token mới
    await tokenService.revokeSession(userId, refreshToken);

    const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn } = tokenService.generateTokens(user);
    await tokenService.saveSession(userId, newRefreshToken);

    return {
      token: newAccessToken,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn,
    };
  }

  /**
   * Đăng xuất hệ thống (Hủy token trên Redis & Session)
   */
  async logout({ token, refreshToken }) {
    if (token) {
      await tokenService.blacklistToken(token);
    }
    if (refreshToken) {
      try {
        const decoded = await tokenService.verifyRefreshToken(refreshToken);
        await tokenService.revokeSession(decoded.userId, refreshToken);
      } catch (e) {
        // bỏ qua nếu refresh token đã hết hạn
      }
    }
    return { success: true, message: 'Đăng xuất thành công. Phiên làm việc đã được hủy bỏ.' };
  }

  /**
   * Lấy thông tin hồ sơ người dùng hiện tại và danh sách quyền
   */
  async getMe(userId) {
    // Hỗ trợ mượt mà tài khoản Demo 999
    if (userId === 999) {
      return {
        user_id: 999,
        username: 'demo_admin',
        email: 'admin@minhduc.vn',
        account_status: 'ACTIVE',
        created_at: new Date().toISOString(),
        role_code: 'ADMIN',
        role_name: 'Quản trị viên Hệ thống (Demo)',
        full_name: 'Quản trị viên Demo',
        phone: '0901234567',
        ava_storage_reference: null,
        permissions: ['*'],
      };
    }

    // Truy vấn thông tin người dùng qua UserRepository
    const user = await userRepository.findFullProfileById(userId);
    if (!user) {
      const error = new Error('Không tìm thấy người dùng.');
      error.status = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    // Lấy quyền qua UserRepository
    const permissions = await userRepository.getPermissionsByRoleId(user.role_id);

    return {
      ...user,
      permissions,
    };
  }
}

export const authService = new AuthService();
export default authService;
