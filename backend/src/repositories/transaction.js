import { pool } from '../config/database.js';


// Chạy nghiệp vụ do service truyền vào trên cùng một kết nối và transaction.
// Thành công thì COMMIT, có lỗi thì ROLLBACK; luôn trả kết nối về pool.
export async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { client.release(); }
}
