import { asyncHandler } from '../utils/async-handler.js';
import { success } from '../utils/response.js';


// Nhận dữ liệu đăng ký đã kiểm tra, gọi service và trả phản hồi tạo tài khoản.
export function createAuthController(service) {
  return {
    signup: asyncHandler(async (req, res) => success(res, {
      status: 201, code: 'ACCOUNT_CREATED', message: 'Đăng ký thành công.',
      data: await service.signup(req.validated.body),
    })),
  };
}
