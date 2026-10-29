import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { z } from "zod";

// Đọc .env của backend và kiểm tra cấu hình trước khi khởi động.
dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });
const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5001),
  CORS_ORIGIN: z.string().url().default("http://localhost:5174"),
  REFRESH_COOKIE_SECURE: z.enum(["true", "false"]).optional(),
  REFRESH_COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  DB_HOST: z.string().min(1).default("127.0.0.1"),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
  DB_USER: z.string().min(1).default("postgres"),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().min(1).default("hrmss_auth"),
  REDIS_URL: z
    .string()
    .url()
    .refine((v) => /^rediss?:\/\//.test(v), "Expected redis:// or rediss://")
    .default("redis://127.0.0.1:6379"),
});
const result = schema.safeParse(process.env);
if (!result.success)
  throw new Error(
    "Invalid configuration fields: " +
      result.error.issues.map((i) => i.path.join(".")).join(", "),
  );

// Cookie production hoặc SameSite=None phải dùng Secure để chỉ gửi qua HTTPS.
if (
  (result.data.NODE_ENV === "production" &&
    result.data.REFRESH_COOKIE_SECURE === "false") ||
  (result.data.REFRESH_COOKIE_SAME_SITE === "none" &&
    !(
      result.data.REFRESH_COOKIE_SECURE === "true" ||
      result.data.NODE_ENV === "production"
    ))
) {
  throw new Error(
    "Refresh cookies require Secure in production and with SameSite=None.",
  );
}
export const env = Object.freeze(result.data);
