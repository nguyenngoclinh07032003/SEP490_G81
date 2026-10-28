import { asyncHandler } from '../utils/async-handler.js';
import { AppError } from '../utils/app-error.js';
// Đọc Bearer token, xác thực phiên và gắn tài khoản hiện tại vào req.auth.
export function authenticate(sessionService) {
  return asyncHandler(async (req, _res, next) => {
    const match = (req.headers.authorization ?? '').match(/^Bearer ([a-f0-9]{64})$/i);
    if (!match) throw new AppError(401, 'UNAUTHENTICATED', 'Vui lòng đăng nhập.');
    req.auth = { account: await sessionService.authenticate(match[1]), token: match[1] };
    next();
  });
}
