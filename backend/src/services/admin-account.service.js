import { internalAccountSchema } from "../validators/auth.validator.js";
import { userIdSchema, accountListSchema, accountStatusUpdateSchema } from "../validators/user-query.validator.js";
import { hashPassword } from "../utils/password.js";
import { AppError } from "../utils/app-error.js";
import { withTransaction } from "../repositories/transaction.js";
import { createUserRepository } from "../repositories/user.repository.js";
import { createPermissionRepository } from "../repositories/permission.repository.js";
import { toPublicAccount, toPublicProfile } from "../mappers/user.mapper.js";

// Điều phối tạo và quản lý tài khoản nội bộ với kiểm tra quyền trực tiếp.
export function createAdminAccountService({
  transaction = withTransaction,
  repository = createUserRepository,
  permissionRepository = createPermissionRepository,
} = {}) {
  return {
    // Chỉ ADMIN ACTIVE có user.create được tạo account/profile nội bộ, kể cả ADMIN mới.
    async createAccount(actorId, input) {
      const id = userIdSchema.safeParse(actorId);
      if (!id.success)
        throw new AppError(401, "UNAUTHENTICATED", "Vui lòng đăng nhập.");
      const parsed = internalAccountSchema.safeParse(input);
      if (!parsed.success)
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "Dữ liệu không hợp lệ.",
          parsed.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        );
      const passwordHash = await hashPassword(parsed.data.password);
      try {
        return await transaction(async (client) => {
          const users = repository(client);
          const permissions = permissionRepository(client);
          // Khóa chia sẻ và đọc lại người thao tác trong transaction, không chỉ tin dữ liệu từ middleware.
          const actor = await users.findAccountByIdForShare(id.data);
          if (!actor || actor.account_status !== "ACTIVE")
            throw new AppError(
              401,
              "UNAUTHENTICATED",
              "Tài khoản không khả dụng.",
            );
          if (
            actor.role_code !== "ADMIN" ||
            !(await permissions.hasPermission(id.data, "user.create"))
          ) {
            throw new AppError(
              403,
              "FORBIDDEN",
              "Chỉ ADMIN có quyền tạo tài khoản nội bộ.",
            );
          }
          const { username, email, full_name, phone, role } = parsed.data;
          const userId = await users.insertAccount({
            username,
            email,
            passwordHash,
            roleCode: role,
          });
          if (!userId)
            throw new AppError(
              503,
              "ROLE_NOT_CONFIGURED",
              "Vai trò chưa được cấu hình.",
            );
          await users.insertProfile({
            userId,
            full_name,
            phone: phone ?? null,
          });
          return {
            account: toPublicAccount(await users.findAccountById(userId)),
            profile: toPublicProfile(await users.findProfileByUserId(userId)),
          };
        });
      } catch (error) {
        if (error.code === "23505")
          throw new AppError(
            409,
            "ACCOUNT_ALREADY_EXISTS",
            "Username hoặc email đã được sử dụng.",
          );
        throw error;
      }
    },

    // Lấy danh sách tài khoản có tìm kiếm, lọc theo vai trò/trạng thái và phân trang.
    async listAccounts(query = {}) {
      const parsed = accountListSchema.safeParse(query);
      if (!parsed.success)
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "Dữ liệu không hợp lệ.",
          parsed.error.issues.map((issue) => ({
            field: issue.path.join(".") || "query",
            message: issue.message,
          })),
        );
      const users = repository();
      const result = await users.listAccounts(parsed.data);
      return {
        items: result.items.map((row) => ({
          ...toPublicAccount(row),
          full_name: row.full_name,
          phone: row.phone,
        })),
        pagination: {
          page: parsed.data.page,
          limit: parsed.data.limit,
          total: Number(result.total),
          totalPages: Math.ceil(Number(result.total) / parsed.data.limit),
        },
      };
    },

    // Lấy chi tiết một tài khoản kèm hồ sơ và danh sách quyền.
    async getAccountDetail(targetUserId) {
      const parsed = userIdSchema.safeParse(targetUserId);
      if (!parsed.success)
        throw new AppError(400, "VALIDATION_ERROR", "ID tài khoản không hợp lệ.");
      const users = repository();
      const permissions = permissionRepository();
      const accountRow = await users.findAccountById(parsed.data);
      if (!accountRow)
        throw new AppError(404, "ACCOUNT_NOT_FOUND", "Không tìm thấy tài khoản.");
      const [profileRow, permissionRows] = await Promise.all([
        users.findProfileByUserId(parsed.data),
        permissions.findPermissionsByUserId(parsed.data),
      ]);
      return {
        account: toPublicAccount(accountRow),
        profile: toPublicProfile(profileRow),
        permissions: permissionRows,
      };
    },

    // Lấy danh sách 5 vai trò cố định trong hệ thống.
    async listRoles() {
      const permissions = permissionRepository();
      return { roles: await permissions.listRoles() };
    },

    // Cập nhật trạng thái tài khoản (ACTIVE / INACTIVE / LOCKED), bảo vệ ADMIN cuối cùng và thu hồi phiên Redis.
    async updateAccountStatus(actorId, targetUserId, input, sessionService) {
      const actorParsed = userIdSchema.safeParse(actorId);
      if (!actorParsed.success)
        throw new AppError(401, "UNAUTHENTICATED", "Vui lòng đăng nhập.");
      const targetParsed = userIdSchema.safeParse(targetUserId);
      if (!targetParsed.success)
        throw new AppError(400, "VALIDATION_ERROR", "ID tài khoản không hợp lệ.");
      const bodyParsed = accountStatusUpdateSchema.safeParse(input);
      if (!bodyParsed.success)
        throw new AppError(400, "VALIDATION_ERROR", "Trạng thái không hợp lệ.");

      const newStatus = bodyParsed.data.status;

      const updated = await transaction(async (client) => {
        const users = repository(client);
        const actor = await users.findAccountByIdForShare(actorParsed.data);
        if (!actor || actor.account_status !== "ACTIVE")
          throw new AppError(401, "UNAUTHENTICATED", "Tài khoản không khả dụng.");
        if (actor.role_code !== "ADMIN")
          throw new AppError(403, "FORBIDDEN", "Chỉ ADMIN có quyền thay đổi trạng thái tài khoản.");

        const target = await users.findAccountByIdForShare(targetParsed.data);
        if (!target)
          throw new AppError(404, "ACCOUNT_NOT_FOUND", "Không tìm thấy tài khoản.");

        if (target.role_code === "ADMIN" && target.account_status === "ACTIVE" && newStatus !== "ACTIVE") {
          const activeAdmins = await users.countActiveAdmins();
          if (activeAdmins <= 1) {
            throw new AppError(409, "LAST_ADMIN_PROTECTED", "Không thể khóa hoặc vô hiệu hóa ADMIN hoạt động cuối cùng.");
          }
        }

        const row = await users.updateAccountStatus(targetParsed.data, newStatus);
        const profile = await users.findProfileByUserId(targetParsed.data);
        return {
          account: toPublicAccount(row),
          profile: toPublicProfile(profile),
        };
      });

      if (newStatus !== "ACTIVE" && sessionService?.logoutAll) {
        await sessionService.logoutAll(targetParsed.data);
      }

      return updated;
    },
  };
}
