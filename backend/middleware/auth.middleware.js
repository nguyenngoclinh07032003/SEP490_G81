import { tokenService } from '../services/index.js';
import pool from '../config/database.js';

/**
 * Middleware xác thực Access Token (JWT 15m) kết hợp Express-Session và kiểm tra Blacklist trong Redis.
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Kiểm tra Bearer Token (JWT 15m) nếu có trong header
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      // Hỗ trợ token vai trò Demo nội bộ
      if (token.startsWith('demo_token_')) {
        const role = token.replace('demo_token_', '');
        req.user = { userId: 999, roleCode: role, username: 'demo_' + role.toLowerCase() };
        return next();
      }

      // Kiểm tra Token Blacklist trong Redis (đã logout hoặc rotate)
      const isBlacklisted = await tokenService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        return res.status(401).json({
          success: false,
          code: 'TOKEN_BLACKLISTED',
          message_code: 'TOKEN_BLACKLISTED',
          message: 'Phiên làm việc đã kết thúc (Token đã bị vô hiệu hóa). Vui lòng đăng nhập lại.',
        });
      }

      try {
        const decoded = tokenService.verifyAccessToken(token);
        req.user = decoded;
        return next();
      } catch (jwtErr) {
        // Nếu lỗi không phải do hết hạn thì từ chối ngay
        if (jwtErr.name !== 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            code: 'TOKEN_INVALID',
            message_code: 'TOKEN_INVALID',
            message: 'Token không hợp lệ hoặc đã bị chỉnh sửa.',
          });
        }
        // Nếu hết hạn (TokenExpiredError), tiếp tục kiểm tra Express-Session ở bước 2
      }
    }

    // 2. Fallback sang Express-Session (duy trì trạng thái phiên qua Cookie session trên trình duyệt)
    if (req.session?.userId) {
      req.user = {
        userId: req.session.userId,
        roleCode: req.session.role,
        fromSession: true,
      };
      return next();
    }

    // 3. Nếu token JWT đã hết hạn và không có Session hợp lệ -> Báo TOKEN_EXPIRED để client gọi Silent Refresh
    if (authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message_code: 'TOKEN_EXPIRED',
        message: 'Token đã hết hạn. Vui lòng làm mới phiên làm việc.',
      });
    }

    return res.status(401).json({
      success: false,
      code: 'UNAUTHENTICATED',
      message_code: 'UNAUTHENTICATED',
      message: 'Không tìm thấy Access Token hoặc phiên đăng nhập hợp lệ. Vui lòng đăng nhập.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 'AUTH_INTERNAL_ERROR',
      message_code: 'AUTH_INTERNAL_ERROR',
      message: 'Lỗi máy chủ khi xác thực phiên làm việc: ' + error.message,
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
        code: 'FORBIDDEN_ROLE',
        message_code: 'FORBIDDEN_ROLE',
        message: 'Bạn không có quyền thực hiện chức năng này.',
      });
    }
    next();
  };
};

/**
 * Middleware phân quyền theo Quyền hạt nhân RBAC (Permissions)
 */
export const requirePermissions = (...requiredPermissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHENTICATED',
        message_code: 'UNAUTHENTICATED',
        message: 'Yêu cầu đăng nhập.',
      });
    }

    if (req.user.roleCode === 'ADMIN') {
      return next();
    }

    try {
      const permRes = await pool.query(
        `SELECT p.permission_code
         FROM role_permission rp
         JOIN permission p ON rp.permission_id = p.permission_id
         WHERE rp.role_id = $1`,
        [req.user.roleId],
      );

      const userPermissions = permRes.rows.map((r) => r.permission_code);
      const hasAllPermissions = requiredPermissions.every((perm) => userPermissions.includes(perm));

      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          code: 'FORBIDDEN_PERMISSION',
          message_code: 'FORBIDDEN_PERMISSION',
          message: 'Bạn không có đủ quyền thực hiện thao tác này.',
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        code: 'PERMISSION_CHECK_ERROR',
        message_code: 'PERMISSION_CHECK_ERROR',
        message: 'Lỗi kiểm tra quyền hạn.',
      });
    }
  };
};
