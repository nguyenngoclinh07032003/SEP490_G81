import { z } from 'zod';

// Giữ ID BIGINT PostgreSQL dưới dạng chuỗi; chuyển qua Number có thể làm mất độ chính xác.
export const userIdSchema = z.string().regex(/^\d{1,19}$/)
  .refine(value => /^\d{1,19}$/.test(value) && BigInt(value) <= 9223372036854775807n, 'ID vượt giới hạn BIGINT');
// Chuẩn hóa username/email dùng khi tra cứu đăng nhập.
export const loginIdentifierSchema = z.string().trim().toLowerCase().min(1).max(254);
// Giới hạn phân trang và bộ lọc được chấp nhận; từ chối trường query ngoài danh sách.
export const accountListSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(254).default(''),
  role: z.enum(['CUSTOMER', 'TECHNICIAN', 'OFFICE_STAFF', 'MANAGER', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED']).optional(),
}).strict();

