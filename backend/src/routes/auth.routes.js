import { Router } from 'express';
import { createAuthController } from '../controllers/auth.controller.js';
import { createSessionController } from '../controllers/session.controller.js';
import { signupSchema, loginSchema, emptyQuerySchema } from '../validators/auth.validator.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authenticate.js';
import { checkAuthOrigin } from '../utils/refresh-cookie.js';


// Khai báo tuyến xác thực; kiểm tra Origin và đầu vào trước khi gọi controller.
export function createAuthRoutes(service, sessionService) {
  const router = Router();
  const controller = createAuthController(service);
  const session = createSessionController(sessionService);
  router.post('/signup', validate({ body: signupSchema, query: emptyQuerySchema }), controller.signup);
  router.post('/login', checkAuthOrigin, validate({ body: loginSchema, query: emptyQuerySchema }), session.login);
  router.post('/refresh', checkAuthOrigin,
    validate({ body: emptyQuerySchema, query: emptyQuerySchema }), session.refresh);
  router.get('/me', authenticate(sessionService), validate({ query: emptyQuerySchema }), session.me);
  
  
  // Có Bearer thì xác thực Bearer; nếu không có thì controller dùng refresh cookie đã kiểm tra Origin.
  router.post('/logout', checkAuthOrigin, (req, res, next) => req.headers.authorization
    ? authenticate(sessionService)(req, res, next) : next(),
    validate({ body: emptyQuerySchema, query: emptyQuerySchema }), session.logout);
  router.post('/logout-all', checkAuthOrigin, authenticate(sessionService),
    validate({ body: emptyQuerySchema, query: emptyQuerySchema }), session.logoutAll);
  return router;
}
