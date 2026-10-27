import 'dotenv/config';
import jwt from 'jsonwebtoken';
import redisClient from '../config/redis.js';

/**
 * Middleware xác thực Access Token (JWT) và kiểm tra Token Blacklist trong Redis.
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy Access Token. Vui lòng đăng nhập.',
      });
    }

    const token = authHeader.split(' ')[1];

    // 1. Kiểm tra Token Blacklist trong Redis (Token đã bị vô hiệu hóa khi người dùng bấm Logout)
    try {
      const isBlacklisted = await redisClient.get(`blacklist:${token}`);
      if (isBlacklisted) {
        return res.status(401).json({
          success: false,
          message: 'Phiên làm việc đã kết thúc (Token đã đăng xuất). Vui lòng đăng nhập lại.',
        });
      }
    } catch (redisErr) {
      console.warn('⚠️ [Redis] Không thể kiểm tra blacklist token:', redisErr.message);
      // Fallback an toàn: nếu Redis tạm gián đoạn, vẫn tiếp tục xác thực chữ ký JWT
    }

    // 2. Xác thực tính toàn vẹn và thời hạn của JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'HRMSS_DEFAULT_SECRET_2026');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Token đã hết hạn. Vui lòng làm mới phiên làm việc.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã bị chỉnh sửa.',
    });
  }
};

/**
 * Middleware phân quyền theo Role (ADMIN, MANAGER, TECHNICIAN, OFFICE_STAFF, CUSTOMER)
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.roleCode)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện chức năng này.',
      });
    }
    next();
  };
};
