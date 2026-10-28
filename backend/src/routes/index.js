import { createAdminAccountRoutes } from './admin-account.routes.js';
import { createAdminAccountService } from '../services/admin-account.service.js';
import { createSessionService } from '../services/session.service.js';
import { createAuthRoutes } from './auth.routes.js';
import { createAuthService } from '../services/auth.service.js';
import { Router } from 'express';
import { createHealthController } from '../controllers/health.controller.js';
import { validate } from '../middlewares/validate.js';
import { emptyQuery } from '../validators/health.validator.js';


// Gắn các tuyến health, xác thực và quản trị vào router API v1.
export function createRoutes(service, authService = createAuthService(), sessionService = createSessionService(), adminAccountService = createAdminAccountService()) {
  const router=Router(); const controller=createHealthController(service);
  router.get('/health',validate({query:emptyQuery}),controller.live);
  router.get('/health/ready',validate({query:emptyQuery}),controller.ready);
  router.use('/auth', createAuthRoutes(authService, sessionService));
  router.use('/admin/accounts', createAdminAccountRoutes(adminAccountService, sessionService));
  return router;
}
