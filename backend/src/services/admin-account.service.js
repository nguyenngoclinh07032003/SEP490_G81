import { internalAccountSchema } from "../validators/auth.validator.js";
import { userIdSchema } from "../validators/user-query.validator.js";
import { hashPassword } from "../utils/password.js";
import { AppError } from "../utils/app-error.js";
import { withTransaction } from "../repositories/transaction.js";
import { createUserRepository } from "../repositories/user.repository.js";
import { createPermissionRepository } from "../repositories/permission.repository.js";
import { toPublicAccount, toPublicProfile } from "../mappers/user.mapper.js";
// Điều phối tạo tài khoản nội bộ với kiểm tra quyền trực tiếp trong transaction.
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
  };
}
