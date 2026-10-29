import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { AppError } from '../utils/app-error.js';
import { internalAccountSchema, emptyQuerySchema } from '../validators/auth.validator.js';
import {
  accountListSchema,
  userIdParamSchema,
  accountStatusUpdateSchema,
} from '../validators/user-query.validator.js';
import { createAdminAccountController } from '../controllers/admin-account.controller.js';

// Chặn người chưa đăng nhập hoặc không phải ADMIN trước khi xử lý quản trị tài khoản.
export function createAdminAccountRoutes(service, sessionService) {
  const router = Router();
  const controller = createAdminAccountController(service, sessionService);
  router.use(authenticate(sessionService));

  // Kiểm tra vai trò ADMIN trước khi cho phép truy cập các API quản trị tài khoản.
  router.use((req, _res, next) =>
    next(
      req.auth.account.role.role_code === 'ADMIN'
        ? undefined
        : new AppError(403, 'FORBIDDEN', 'Chỉ ADMIN có quyền quản trị tài khoản.'),
    ),
  );

  router.get('/', validate({ query: accountListSchema }), controller.list);
  router.get('/roles', validate({ query: emptyQuerySchema }), controller.roles);
  router.get('/:id', validate({ params: userIdParamSchema, query: emptyQuerySchema }), controller.detail);
  router.post('/', validate({ body: internalAccountSchema, query: emptyQuerySchema }), controller.create);
  router.patch(
    '/:id/status',
    validate({ params: userIdParamSchema, body: accountStatusUpdateSchema, query: emptyQuerySchema }),
    controller.updateStatus,
  );

  return router;
}
