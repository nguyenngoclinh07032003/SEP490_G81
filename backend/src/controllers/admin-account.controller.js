import { asyncHandler } from '../utils/async-handler.js';
import { success } from '../utils/response.js';

// Điều phối các thao tác quản trị tài khoản từ HTTP sang service.
export function createAdminAccountController(service, sessionService) {
  return {
    create: asyncHandler(async (req, res) =>
      success(res, {
        status: 201,
        code: 'ACCOUNT_CREATED',
        message: 'Đã tạo tài khoản nội bộ.',
        data: await service.createAccount(req.auth.account.user_id, req.validated.body),
      }),
    ),

    list: asyncHandler(async (req, res) =>
      success(res, {
        code: 'ACCOUNTS_RETRIEVED',
        message: 'Đã tải danh sách tài khoản.',
        data: await service.listAccounts(req.validated.query),
      }),
    ),

    roles: asyncHandler(async (_req, res) =>
      success(res, {
        code: 'ROLES_RETRIEVED',
        message: 'Đã tải danh sách vai trò.',
        data: await service.listRoles(),
      }),
    ),

    detail: asyncHandler(async (req, res) =>
      success(res, {
        code: 'ACCOUNT_DETAIL_RETRIEVED',
        message: 'Đã tải thông tin chi tiết tài khoản.',
        data: await service.getAccountDetail(req.validated.params.id),
      }),
    ),

    updateStatus: asyncHandler(async (req, res) =>
      success(res, {
        code: 'ACCOUNT_STATUS_UPDATED',
        message: 'Đã cập nhật trạng thái tài khoản.',
        data: await service.updateAccountStatus(
          req.auth.account.user_id,
          req.validated.params.id,
          req.validated.body,
          sessionService,
        ),
      }),
    ),
  };
}
