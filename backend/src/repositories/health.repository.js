import { pool } from '../config/database.js';
import { redis, connectRedis } from '../config/redis.js';
// Kiểm tra kết nối và các bảng trong truy vấn User/Auth; LIMIT 0 không đọc dữ liệu người dùng.
export async function checkPostgres() { await pool.query(`SELECT u.user_id FROM hrmss.user_account u
  JOIN hrmss.role r ON r.role_id=u.role_id
  LEFT JOIN hrmss.user_information i ON i.user_id=u.user_id
  LEFT JOIN hrmss.role_permission rp ON rp.role_id=r.role_id
  LEFT JOIN hrmss.permission p ON p.permission_id=rp.permission_id LIMIT 0`); }
// Mở kết nối nếu cần và gửi PING để kiểm tra Redis.
export async function checkRedis() { await connectRedis(); await redis.ping(); }
