import { z } from "zod";
// Dùng chung các trường tài khoản; chuẩn hóa username/email nhưng giữ nguyên mật khẩu.
const accountFields = {
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(100)
    .refine((value) => !value.includes("@"), "Username không được chứa @."),
  email: z.string().trim().toLowerCase().max(254).email(),
  password: z.string().min(8).max(64),
  confirm_password: z.string().min(8).max(64),
  full_name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(30).optional(),
};
// Kiểm tra mật khẩu và xác nhận trùng nhau.
const passwordsMatch = (value) => value.password === value.confirm_password;
const mismatch = {
  path: ["confirm_password"],
  message: "Xác nhận mật khẩu không khớp.",
};
// Schema strict từ chối trường lạ; đăng ký công khai không nhận role/status.
export const signupSchema = z
  .object(accountFields)
  .strict()
  .refine(passwordsMatch, mismatch);
// Tài khoản nội bộ chỉ nhận các vai trò ADMIN được phép tạo.
export const internalAccountSchema = z
  .object({
    ...accountFields,
    role: z.enum(["MANAGER", "OFFICE_STAFF", "TECHNICIAN", "ADMIN"]),
  })
  .strict()
  .refine(passwordsMatch, mismatch);
// Chấp nhận username/email và mật khẩu; không chấp nhận tham số thừa.
export const loginSchema = z
  .object({
    identifier: z.string().trim().toLowerCase().min(1).max(254),
    password: z.string().min(8).max(64),
  })
  .strict();
// Buộc query hoặc body tương ứng là đối tượng rỗng.
export const emptyQuerySchema = z.object({}).strict();
