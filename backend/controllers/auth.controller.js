import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import redisClient from '../config/redis.js';

// Cấu hình số lần đăng nhập sai tối đa và thời gian khóa (theo SRS JOB-01)
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 900; // 15 phút

/**
 * [POST] /api/auth/register - Đăng ký tài khoản mới
 */
export const register = async (req, res) => {
  const client = await pool.connect();
  try {
    const { username, password, email, fullName, phone, roleCode = 'CUSTOMER' } = req.body;

    // 1. Kiểm tra đầu vào bắt buộc
    if (!username || !password || !fullName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: Tên đăng nhập, Mật khẩu, Họ tên và Số điện thoại.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải chứa ít nhất 6 ký tự.',
      });
    }

    // 2. Kiểm tra tên đăng nhập đã tồn tại chưa
    const existingUser = await client.query(
      'SELECT user_id FROM user_account WHERE username = $1 OR (email IS NOT NULL AND email = $2) LIMIT 1',
      [username.trim().toLowerCase(), email?.trim()?.toLowerCase() || null],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Tên đăng nhập hoặc Email này đã được sử dụng. Vui lòng chọn tên khác.',
      });
    }

    // 3. Tìm role_id tương ứng
    const roleRes = await client.query('SELECT role_id, role_code FROM role WHERE role_code = $1', [
      roleCode.toUpperCase(),
    ]);

    if (roleRes.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Quyền người dùng '${roleCode}' không hợp lệ.`,
      });
    }

    const roleId = roleRes.rows[0].role_id;

    // 4. Băm mật khẩu an toàn
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. Bắt đầu Transaction ghi đồng bộ vào 2 bảng: user_account & user_information
    await client.query('BEGIN');

    // 5.1. Tạo bản ghi đăng nhập (user_account)
    const newUserRes = await client.query(
      `INSERT INTO user_account (role_id, username, password_hash, email, account_status)
       VALUES ($1, $2, $3, $4, 'ACTIVE')
       RETURNING user_id, role_id, username, email, account_status, created_at`,
      [roleId, username.trim().toLowerCase(), passwordHash, email?.trim()?.toLowerCase() || null],
    );
    const newUser = newUserRes.rows[0];

    // 5.2. Tạo bản ghi hồ sơ cá nhân (user_information)
    const newProfileRes = await client.query(
      `INSERT INTO user_information (user_id, full_name, phone)
       VALUES ($1, $2, $3)
       RETURNING user_info_id, full_name, phone`,
      [newUser.user_id, fullName.trim(), phone.trim()],
    );
    const newProfile = newProfileRes.rows[0];

    // 5.3. Nếu là Khách hàng (CUSTOMER), đồng bộ luôn vào bảng customer
    if (roleCode.toUpperCase() === 'CUSTOMER') {
      await client.query(
        `INSERT INTO customer (user_id, customer_name, phone, email)
         VALUES ($1, $2, $3, $4)`,
        [newUser.user_id, fullName.trim(), phone.trim(), email?.trim()?.toLowerCase() || null],
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      data: {
        userId: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        fullName: newProfile.full_name,
        phone: newProfile.phone,
        role: roleCode.toUpperCase(),
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi đăng ký:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đăng ký tài khoản.',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * [POST] /api/auth/login - Đăng nhập hệ thống (Có tích hợp Redis Rate Limit & Lockout)
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên đăng nhập (hoặc email) và mật khẩu.',
      });
    }

    const identifier = username.trim().toLowerCase();

    // 1. Kiểm tra khóa tài khoản trong Redis (Chống Brute-Force)
    try {
      const isLocked = await redisClient.get(`lockout:${identifier}`);
      if (isLocked) {
        const ttl = await redisClient.ttl(`lockout:${identifier}`);
        const minutesLeft = Math.ceil(ttl / 60);
        return res.status(429).json({
          success: false,
          message: `Tài khoản tạm thời bị khóa do nhập sai mật khẩu quá ${MAX_LOGIN_ATTEMPTS} lần. Vui lòng thử lại sau ${minutesLeft} phút.`,
        });
      }
    } catch (redisErr) {
      console.warn('⚠️ [Redis] Bỏ qua kiểm tra lockout:', redisErr.message);
    }

    // 2. Tìm tài khoản trong database
    const userRes = await pool.query(
      `SELECT u.user_id, u.role_id, u.username, u.password_hash, u.email, u.account_status,
              r.role_code, r.role_name,
              info.full_name, info.phone, info.ava_storage_reference
       FROM user_account u
       JOIN role r ON u.role_id = r.role_id
       LEFT JOIN user_information info ON u.user_id = info.user_id
       WHERE u.username = $1 OR (u.email IS NOT NULL AND u.email = $1)
       LIMIT 1`,
      [identifier],
    );

    // Hàm phụ trợ ghi nhận đăng nhập sai vào Redis
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

    if (userRes.rows.length === 0) {
      await recordFailedAttempt();
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
      });
    }

    const user = userRes.rows[0];

    // 3. Kiểm tra trạng thái tài khoản
    if (user.account_status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: `Tài khoản của bạn đang ở trạng thái '${user.account_status}'. Vui lòng liên hệ quản trị viên.`,
      });
    }

    // 4. So khớp mật khẩu bằng bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      const attempts = await recordFailedAttempt();
      const remainingAttempts = Math.max(0, MAX_LOGIN_ATTEMPTS - attempts);
      return res.status(401).json({
        success: false,
        message: remainingAttempts > 0
          ? `Mật khẩu không chính xác. Bạn còn ${remainingAttempts} lần thử trước khi bị khóa tạm thời.`
          : `Đã nhập sai quá ${MAX_LOGIN_ATTEMPTS} lần liên tiếp. Tài khoản bị tạm khóa 15 phút.`,
      });
    }

    // 5. Đăng nhập thành công -> Xóa bộ đếm số lần sai trong Redis
    try {
      await redisClient.del(`attempts:${identifier}`);
      await redisClient.del(`lockout:${identifier}`);
    } catch (e) {
      // bỏ qua nếu lỗi redis
    }

    // 6. Ký Access Token (JWT)
    const tokenPayload = {
      userId: user.user_id,
      username: user.username,
      email: user.email,
      roleId: user.role_id,
      roleCode: user.role_code,
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'HRMSS_DEFAULT_SECRET_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
    );

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        token,
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
      },
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đăng nhập.',
      error: error.message,
    });
  }
};

/**
 * [POST] /api/auth/logout - Đăng xuất (Vô hiệu hóa Token bằng Redis Blacklist)
 */
export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(200).json({ success: true, message: 'Đăng xuất thành công.' });
    }

    const token = authHeader.split(' ')[1];

    // Giải mã token để tính thời gian sống còn lại
    const decoded = jwt.decode(token);
    if (decoded?.exp) {
      const remainingTime = decoded.exp - Math.floor(Date.now() / 1000);
      if (remainingTime > 0) {
        // Lưu token vào Redis Blacklist kèm TTL tự hủy bằng đúng remainingTime
        await redisClient.set(`blacklist:${token}`, 'revoked', { EX: remainingTime });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công. Token đã được đưa vào danh sách vô hiệu hóa.',
    });
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đăng xuất.',
      error: error.message,
    });
  }
};

/**
 * [GET] /api/auth/me - Lấy thông tin tài khoản hiện tại từ token
 */
export const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userRes = await pool.query(
      `SELECT u.user_id, u.username, u.email, u.account_status, u.created_at,
              r.role_code, r.role_name,
              info.full_name, info.phone, info.ava_storage_reference,
              info.location_sharing_enabled, info.latitude, info.longitude
       FROM user_account u
       JOIN role r ON u.role_id = r.role_id
       LEFT JOIN user_information info ON u.user_id = info.user_id
       WHERE u.user_id = $1
       LIMIT 1`,
      [userId],
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng.',
      });
    }

    return res.status(200).json({
      success: true,
      data: userRes.rows[0],
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin cá nhân:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy thông tin người dùng.',
      error: error.message,
    });
  }
};
