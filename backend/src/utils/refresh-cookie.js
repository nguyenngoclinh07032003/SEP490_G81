import { env } from '../config/env.js';
import { AppError } from './app-error.js';
export const refreshCookieName = 'hrmss_refresh';
// HttpOnly ngăn JavaScript đọc cookie; Secure bảo vệ khi truyền; giới hạn cookie trong các tuyến auth.
const options = {
  httpOnly: true,
  secure: env.REFRESH_COOKIE_SECURE === 'true' || env.NODE_ENV === 'production',
  sameSite: env.REFRESH_COOKIE_SAME_SITE,
  path: '/api/v1/auth',
};
// Đọc đúng một refresh cookie; từ chối cookie trùng tên để tránh chọn nhầm token.
export function readRefreshCookie(req) {
  const values = (req.headers.cookie ?? '').split(';').map(value => value.trim())
    .filter(value => value.startsWith(refreshCookieName + '='));
  if (values.length !== 1) return undefined;
  return values[0].slice(refreshCookieName.length + 1);
}
// Gửi refresh cookie với thời hạn còn lại; Express nhận maxAge theo mili giây.
export function setRefreshCookie(res, token, seconds) {
  res.cookie(refreshCookieName, token, { ...options, maxAge: seconds * 1000 });
}
// Xóa cookie với cùng path và thuộc tính đã dùng khi tạo.
export function clearRefreshCookie(res) {
  res.clearCookie(refreshCookieName, options);
}
// Chống CSRF bằng Origin FE được cấu hình.
// Refresh/logout dùng cookie bắt buộc có Origin; các yêu cầu có Origin khác đều bị từ chối.
export function checkAuthOrigin(req, _res, next) {
  const origin = req.headers.origin;
  const cookieAuthentication = req.path === '/refresh'
    || (req.path === '/logout' && !req.headers.authorization);
  if ((origin && origin !== new URL(env.CORS_ORIGIN).origin) || (cookieAuthentication && !origin)) {
    return next(new AppError(403, 'ORIGIN_FORBIDDEN', 'Nguồn yêu cầu không hợp lệ.'));
  }
  next();
}
