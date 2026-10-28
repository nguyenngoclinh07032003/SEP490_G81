import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

// Endpoint gốc giới thiệu danh mục các dịch vụ API của hệ thống
router.get('/', (_req, res) => {
  res.json({
    message: 'Chào mừng đến với API Dịch Vụ Minh Đức (Minh Duc Home Maintenance & Repair Service System)',
    status: 'ONLINE',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refreshToken: 'POST /api/auth/refresh-token',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
      },
    },
  });
});

// Gom các route con vào đầu mối quản lý tập trung
router.use('/', healthRoutes);     // => /health, /api/health
router.use('/auth', authRoutes);   // => /auth, /api/auth (register, login, logout, me, refresh-token)

// Middleware xử lý 404 cho các route không tồn tại (trả về JSON chuẩn, không trả HTML)
router.use((_req, res) => {
  res.status(404).json({
    success: false,
    code: 'ROUTE_NOT_FOUND',
    message_code: 'ROUTE_NOT_FOUND',
    message: 'Endpoint API không tồn tại trên hệ thống.',
  });
});

// Middleware xử lý lỗi toàn cục (Global Error Handler)
router.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  res.status(status).json({
    success: false,
    code,
    message_code: code,
    message: err.message || 'Lỗi hệ thống nội bộ máy chủ.',
  });
});

export default router;
