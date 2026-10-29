import { asyncHandler } from '../utils/async-handler.js';
import { success } from '../utils/response.js';
import { readRefreshCookie, setRefreshCookie, clearRefreshCookie } from '../utils/refresh-cookie.js';


// Đặt refresh token vào cookie HttpOnly; chỉ trả access token và thông tin công khai trong JSON.
function sendTokens(res, code, result) {
  const { refreshToken, refreshExpiresIn, ...data } = result;
  setRefreshCookie(res, refreshToken, refreshExpiresIn);
  return success(res, { code, data });
}


// Điều phối các thao tác đăng nhập, làm mới và đăng xuất từ HTTP sang service.
export function createSessionController(service) {
  return {
    // Đăng nhập và cấp cookie cho nhóm phiên mới.
    login: asyncHandler(async (req, res) => sendTokens(res, 'LOGIN_SUCCESS', await service.login(req.validated.body, req.ip))),
    
    // Đổi cặp token; chỉ xóa cookie khi phiên không hợp lệ, giữ lại nếu dịch vụ tạm lỗi.
    refresh: asyncHandler(async (req, res) => {
      try { return sendTokens(res, 'REFRESH_SUCCESS', await service.refresh(readRefreshCookie(req))); }
      catch (error) { if (error.status === 401) clearRefreshCookie(res); throw error; }
    }),
    
    // Trả tài khoản và hồ sơ của người dùng đã được middleware xác thực.
    me: asyncHandler(async (req, res) => {
      const profile = typeof service?.getProfile === 'function'
        ? await service.getProfile(req.auth.account.user_id)
        : null;
      return success(res, { data: { account: req.auth.account, profile } });
    }),
    
    // Thu hồi nhóm phiên hiện tại bằng Bearer hoặc cookie rồi xóa cookie trên trình duyệt.
    logout: asyncHandler(async (req, res) => {
      if (req.auth) await service.logout(req.auth.token);
      else await service.logoutRefresh(readRefreshCookie(req));
      clearRefreshCookie(res);
      return success(res, { code: 'LOGOUT_SUCCESS', message: 'Đã đăng xuất.' });
    }),
    
    // Thu hồi các phiên của tài khoản hiện tại và xóa cookie trên trình duyệt.
    logoutAll: asyncHandler(async (req, res) => {
      await service.logoutAll(req.auth.account.user_id);
      clearRefreshCookie(res);
      return success(res, { code: 'LOGOUT_ALL_SUCCESS', message: 'Đã đăng xuất tất cả thiết bị.' });
    }),
  };
}
