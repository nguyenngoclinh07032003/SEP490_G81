import { Router } from 'express';
import { createAdminAccountRoutes } from './admin-account.routes.js';
import { createAdminAccountService } from '../services/admin-account.service.js';
import { createSessionService } from '../services/session.service.js';
import { createAuthRoutes } from './auth.routes.js';
import { createAuthService } from '../services/auth.service.js';

// Gắn các tuyến xác thực và quản trị vào router API v1.
export function createRoutes(
  authService = createAuthService(),
  sessionService = createSessionService(),
  adminAccountService = createAdminAccountService(),
) {
  const router = Router();
  router.get('/', (_req, res) => {
    res.status(200).json({ message: 'Đã kết nối đến server' });
  });
  router.use('/auth', createAuthRoutes(authService, sessionService));
  router.use('/admin/accounts', createAdminAccountRoutes(adminAccountService, sessionService));
  return router;
}
