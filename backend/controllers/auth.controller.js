import { authService } from '../services/index.js';

/**
 * ==============================================================================
 * DỊCH VỤ MINH ĐỨC - AUTH CONTROLLER (TẦNG ĐIỀU KHIỂN & HTTP RESPONSE)
 * ==============================================================================
 * Nhiệm vụ:
 * - Tiếp nhận req, trích xuất dữ liệu body/params/headers/session
 * - Chuẩn hóa mã lỗi máy đọc được (code & message_code) cho Frontend
 * - Đồng bộ phiên đăng nhập vào express-session (lưu trữ Redis)
 * - Ủy quyền xử lý nghiệp vụ sang authService
 * - Chuẩn hóa phản hồi HTTP response về cho Routes/Client
 */

/**
 * [POST] /api/auth/register - Đăng ký tài khoản mới
 */
export const register = async (req, res) => {
  try {
    const data = await authService.register(req.body);
    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      data,
    });
  } catch (error) {
    const status = error.status || 500;
    const code = error.code || 'REGISTER_FAILED';
    return res.status(status).json({
      success: false,
      code,
      message_code: code,
      message: error.message || 'Lỗi máy chủ khi đăng ký tài khoản.',
    });
  }
};

/**
 * [POST] /api/auth/login - Đăng nhập hệ thống (Access Token 15m + Refresh Token 7d + Express-Session)
 */
export const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);

    // Duy trì phiên đăng nhập trong express-session (lưu trữ trên Redis)
    if (req.session) {
      req.session.userId = data.user.userId;
      req.session.role = data.user.role;
      req.session.refreshToken = data.refreshToken;

      // Lưu chắc chắn vào store trước khi gửi response kèm cookie Set-Cookie
      await new Promise((resolve) => req.session.save(() => resolve()));
    }

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      data,
    });
  } catch (error) {
    const status = error.status || 500;
    const code = error.code || 'LOGIN_FAILED';
    return res.status(status).json({
      success: false,
      code,
      message_code: code,
      message: error.message || 'Lỗi máy chủ khi đăng nhập.',
    });
  }
};

/**
 * [POST] /api/auth/refresh-token - Cấp mới Access Token (15 phút) & Blacklist Token cũ (Silent Refresh)
 */
export const refreshToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const oldAccessToken = req.body?.oldAccessToken || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);
    // Hỗ trợ lấy Refresh Token từ body hoặc trực tiếp từ Express-Session cookie
    const refreshToken = req.body?.refreshToken || req.session?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        code: 'REFRESH_TOKEN_REQUIRED',
        message_code: 'REFRESH_TOKEN_REQUIRED',
        message: 'Không tìm thấy Refresh Token trong yêu cầu hoặc phiên làm việc Session đã hết hạn.',
      });
    }

    const data = await authService.refreshToken({ refreshToken, oldAccessToken });

    // Cập nhật Refresh Token mới vào Express-Session
    if (req.session) {
      req.session.refreshToken = data.refreshToken;
      await new Promise((resolve) => req.session.save(() => resolve()));
    }

    return res.status(200).json({
      success: true,
      message: 'Làm mới phiên làm việc thành công!',
      data,
    });
  } catch (error) {
    const status = error.status || 500;
    const code = error.code || 'REFRESH_FAILED';
    return res.status(status).json({
      success: false,
      code,
      message_code: code,
      message: error.message || 'Lỗi máy chủ khi làm mới token.',
    });
  }
};

/**
 * [POST] /api/auth/logout - Đăng xuất (Vô hiệu hóa Token bằng Redis Blacklist & Hủy Session)
 */
export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const refreshToken = req.body?.refreshToken || req.session?.refreshToken;

    const data = await authService.logout({ token, refreshToken });

    // Hủy phiên express-session trong Redis và xóa cookie phiên của trình duyệt
    if (req.session) {
      await new Promise((resolve) => req.session.destroy(() => resolve()));
      res.clearCookie('hrmss.sid');
    }

    return res.status(200).json({
      success: true,
      message: data.message || 'Đăng xuất thành công.',
    });
  } catch (error) {
    const status = error.status || 500;
    const code = error.code || 'LOGOUT_FAILED';
    return res.status(status).json({
      success: false,
      code,
      message_code: code,
      message: error.message || 'Lỗi máy chủ khi đăng xuất.',
    });
  }
};

/**
 * [GET] /api/auth/me - Lấy thông tin tài khoản hiện tại từ Token hoặc Session
 */
export const getMe = async (req, res) => {
  try {
    const userId = req.user?.userId || req.session?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHENTICATED',
        message_code: 'UNAUTHENTICATED',
        message: 'Không tìm thấy thông tin định danh người dùng.',
      });
    }

    const data = await authService.getMe(userId);
    const user = {
      userId: data.user_id,
      username: data.username,
      email: data.email,
      fullName: data.full_name,
      phone: data.phone,
      avatar: data.ava_storage_reference,
      role: data.role_code,
      roleName: data.role_name,
      isLoggedIn: true,
    };

    return res.status(200).json({
      success: true,
      data: {
        user,
        permissions: data.permissions || [],
        sessionActive: !!req.session?.userId,
      },
    });
  } catch (error) {
    const status = error.status || 500;
    const code = error.code || 'GET_USER_FAILED';
    return res.status(status).json({
      success: false,
      code,
      message_code: code,
      message: error.message || 'Lỗi máy chủ khi lấy thông tin người dùng.',
    });
  }
};
