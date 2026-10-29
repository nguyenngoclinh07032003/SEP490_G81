import { signupSchema } from "../validators/auth.validator.js";
import { hashPassword } from "../utils/password.js";
import { AppError } from "../utils/app-error.js";
import { withTransaction } from "../repositories/transaction.js";
import { createUserRepository } from "../repositories/user.repository.js";
import { toPublicAccount, toPublicProfile } from "../mappers/user.mapper.js";

// Điều phối nghiệp vụ đăng ký tài khoản khách hàng.
export function createAuthService({
  transaction = withTransaction,
  repository = createUserRepository,
} = {}) {
  return {
    // Kiểm tra dữ liệu, băm mật khẩu rồi tạo account/profile trong cùng transaction.
    async signup(input) {
      const parsed = signupSchema.safeParse(input);
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
      const { username, email, password, full_name, phone } = parsed.data;
      const passwordHash = await hashPassword(password);
      try {
        return await transaction(async (client) => {
          const users = repository(client);
          // Tự gán CUSTOMER; không nhận role/trạng thái từ yêu cầu đăng ký công khai.
          const userId = await users.insertAccount({
            username,
            email,
            passwordHash,
            roleCode: "CUSTOMER",
          });
          if (!userId)
            throw new AppError(
              503,
              "ROLE_NOT_CONFIGURED",
              "Vai trò khách hàng chưa được cấu hình.",
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
