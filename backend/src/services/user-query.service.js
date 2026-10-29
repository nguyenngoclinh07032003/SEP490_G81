import { createUserRepository } from "../repositories/user.repository.js";
import { createPermissionRepository } from "../repositories/permission.repository.js";
import { toPublicAccount, toPublicProfile } from "../mappers/user.mapper.js";
import {
  userIdSchema,
  loginIdentifierSchema,
  accountListSchema,
} from "../validators/user-query.validator.js";
import { AppError } from "../utils/app-error.js";

// Kiểm tra đầu vào bằng schema và chuyển lỗi thành định dạng thống nhất của API.
function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success)
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Dữ liệu không hợp lệ.",
      result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "input",
        message: issue.message,
      })),
    );
  return result.data;
}

// Các hàm truy vấn nội bộ, chưa phải API công khai.
// Controller phải kiểm tra xác thực, quyền và phạm vi own/assigned/all trước khi gọi.
export function createUserQueryService({
  users = createUserRepository(),
  permissions = createPermissionRepository(),
} = {}) {
  return {
    // Lấy tài khoản theo ID và loại các trường không được công khai.
    async findAccountById(id) {
      return toPublicAccount(
        await users.findAccountById(parse(userIdSchema, id)),
      );
    },
    // Lấy hồ sơ theo ID đã được kiểm tra hợp lệ.
    async findProfileByUserId(id) {
      return toPublicProfile(
        await users.findProfileByUserId(parse(userIdSchema, id)),
      );
    },
    // Chuẩn hóa username/email rồi lấy dữ liệu phục vụ kiểm tra mật khẩu.
    async findCredentialsForLogin(identifier) {
      // Chứa password_hash: chỉ dùng nội bộ để xác thực, không trả trực tiếp từ controller.
      return users.findCredentialsByIdentifier(
        parse(loginIdentifierSchema, identifier),
      );
    },
    // Kiểm tra bộ lọc, ánh xạ tài khoản công khai và tính thông tin phân trang.
    async listAccounts(query = {}) {
      const input = parse(accountListSchema, query);
      const result = await users.listAccounts(input);
      return {
        items: result.items.map((row) => ({
          ...toPublicAccount(row),
          full_name: row.full_name,
          phone: row.phone,
        })),
        pagination: {
          page: input.page,
          limit: input.limit,
          total: Number(result.total),
          totalPages: Math.ceil(Number(result.total) / input.limit),
        },
      };
    },
    // Lấy danh sách quyền của tài khoản theo ID hợp lệ.
    async findPermissionsByUserId(id) {
      return permissions.findPermissionsByUserId(parse(userIdSchema, id));
    },
    // Kiểm tra định dạng ID/mã quyền rồi truy vấn quyền hiện tại.
    async hasPermission(id, code) {
      const userId = parse(userIdSchema, id);
      if (typeof code !== "string" || !/^[a-z][a-z0-9_.]{0,99}$/.test(code)) {
        throw new AppError(400, "VALIDATION_ERROR", "Mã quyền không hợp lệ.");
      }
      return permissions.hasPermission(userId, code);
    },
    // Lấy danh mục vai trò từ repository.
    listRoles: () => permissions.listRoles(),
  };
}
