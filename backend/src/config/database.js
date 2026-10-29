import pg from 'pg';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Giữ ngày/giờ không có múi giờ dưới dạng chuỗi, tránh tự đổi theo múi giờ máy chạy.
pg.types.setTypeParser(1114, value => value);
pg.types.setTypeParser(1082, value => value);

// Dùng chung nhóm kết nối PostgreSQL; truy vấn mặc định trong schema hrmss, múi giờ UTC.
export const pool = new pg.Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  max: 10,
  connectionTimeoutMillis: 3000,
  query_timeout: 3000,
  options: '-c timezone=UTC -c search_path=hrmss',
});

pool.on('error', error => logger.error('PostgreSQL pool error', { code: error.code || error.name }));

// Kiểm tra kết nối PostgreSQL và các bảng trong truy vấn User/Auth ngay khi khởi động.
export async function checkPostgres() {
  await pool.query(`SELECT u.user_id FROM hrmss.user_account u
    JOIN hrmss.role r ON r.role_id = u.role_id
    LEFT JOIN hrmss.user_information i ON i.user_id = u.user_id
    LEFT JOIN hrmss.role_permission rp ON rp.role_id = r.role_id
    LEFT JOIN hrmss.permission p ON p.permission_id = rp.permission_id LIMIT 0`);
  logger.info(`[PostgreSQL] Connected to "${env.DB_NAME}" at ${env.DB_HOST}:${env.DB_PORT}`);
}
