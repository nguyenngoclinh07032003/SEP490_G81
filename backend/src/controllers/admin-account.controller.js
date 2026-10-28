import { asyncHandler } from '../utils/async-handler.js';
import { success } from '../utils/response.js';


// Chuyển yêu cầu tạo tài khoản nội bộ cùng ID người thực hiện sang service.
export function createAdminAccountController(service) {
  return { create: asyncHandler(async (req, res) => success(res, {
    status: 201, code: 'ACCOUNT_CREATED', message: 'Đã tạo tài khoản nội bộ.',
    data: await service.createAccount(req.auth.account.user_id, req.validated.body),
  })) };
}
