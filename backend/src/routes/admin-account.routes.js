import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { AppError } from '../utils/app-error.js';
import { internalAccountSchema, emptyQuerySchema } from '../validators/auth.validator.js';
import { createAdminAccountController } from '../controllers/admin-account.controller.js';


// Chặn người chưa đăng nhập hoặc không phải ADMIN trước khi xử lý tạo tài khoản.
export function createAdminAccountRoutes(service, sessionService) {
  const router = Router();
  const controller = createAdminAccountController(service);
  router.use(authenticate(sessionService));
  
  
  // Service còn kiểm tra lại ACTIVE và permission user.create trong transaction.
  router.use((req, _res, next) => next(req.auth.account.role.role_code === 'ADMIN' ? undefined
    : new AppError(403, 'FORBIDDEN', 'Chỉ ADMIN có quyền tạo tài khoản nội bộ.')));
  router.post('/', validate({ body: internalAccountSchema, query: emptyQuerySchema }), controller.create);
  return router;
}
