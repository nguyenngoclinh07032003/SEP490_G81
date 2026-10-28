import { UserAccountModel, UserInformationModel, RoleModel } from '../models/index.js';
import { pool } from '../config/database.js';


// Danh sách cột tài khoản công khai, dùng chung cho các truy vấn có JOIN vai trò.
const publicColumns = `u.user_id::text, u.role_id::text, u.username, u.email,
  u.account_status, u.created_at, u.updated_at, r.role_code, r.role_name`;


// Tập hợp truy vấn tài khoản/hồ sơ; có thể nhận kết nối transaction từ service.
export function createUserRepository(db = pool) {
  return {
    
    // Đọc tài khoản và khóa chia sẻ dòng tài khoản đến cuối transaction để tránh sửa đồng thời.
    async findAccountByIdForShare(userId) {
      const { rows } = await db.query(`SELECT ${publicColumns}
        FROM hrmss.${UserAccountModel.table} u JOIN hrmss.${RoleModel.table} r ON r.role_id=u.role_id
        WHERE u.user_id=$1 FOR SHARE OF u`, [userId]);
      return rows[0] ?? null;
    },
    
    // Tạo tài khoản ACTIVE theo mã vai trò; trả ID hoặc null nếu vai trò chưa được cấu hình.
    async insertAccount({ username, email, passwordHash, roleCode }) {
      const { rows } = await db.query(`INSERT INTO hrmss.${UserAccountModel.table}
        (role_id, username, email, password_hash, account_status)
        SELECT role_id, $1, $2, $3, 'ACTIVE' FROM hrmss.${RoleModel.table}
        WHERE role_code = $4 RETURNING user_id::text`, [username, email, passwordHash, roleCode]);
      return rows[0]?.user_id ?? null;
    },
    
    // Tạo hồ sơ gắn với tài khoản vừa được cấp ID.
    async insertProfile({ userId, full_name, phone }) {
      await db.query(`INSERT INTO hrmss.${UserInformationModel.table} (user_id, full_name, phone)
        VALUES ($1, $2, $3)`, [userId, full_name, phone]);
    },
    
    // Lấy tài khoản và vai trò theo ID, không lấy mật khẩu đã băm.
    async findAccountById(userId) {
      const { rows } = await db.query(`SELECT ${publicColumns}
        FROM hrmss.${UserAccountModel.table} u JOIN hrmss.${RoleModel.table} r ON r.role_id = u.role_id
        WHERE u.user_id = $1`, [userId]);
      return rows[0] ?? null;
    },
    
    // Tìm theo username/email để đăng nhập; chứa password_hash, chỉ dùng nội bộ khi xác thực.
    async findCredentialsByIdentifier(identifier) {
      const { rows } = await db.query(`SELECT ${publicColumns}, u.password_hash
        FROM hrmss.${UserAccountModel.table} u JOIN hrmss.${RoleModel.table} r ON r.role_id = u.role_id
        WHERE u.username = $1 OR u.email = $1`, [identifier]);
      return rows[0] ?? null;
    },
    
    // Lấy hồ sơ cá nhân theo ID tài khoản.
    async findProfileByUserId(userId) {
      const { rows } = await db.query(`SELECT user_id::text, full_name, phone,
        ava_storage_reference, created_at, updated_at
        FROM hrmss.${UserInformationModel.table} WHERE user_id = $1`, [userId]);
      return rows[0] ?? null;
    },
    
    // Tìm tài khoản theo từ khóa, vai trò, trạng thái và phân trang trong SQL.
    async listAccounts({ page, limit, search, role, status }) {
      const values = [];
      const conditions = [];
      if (search) {
        
        // Thoát ký tự đặc biệt của LIKE để từ khóa được hiểu là văn bản thường.
        values.push('%' + search.replace(/[!%_]/g, '!$&') + '%');
        conditions.push(`(u.username ILIKE $1 ESCAPE '!' OR u.email ILIKE $1 ESCAPE '!'
          OR i.full_name ILIKE $1 ESCAPE '!' OR i.phone ILIKE $1 ESCAPE '!')`);
      }
      if (role) { values.push(role); conditions.push(`r.role_code = $${values.length}`); }
      if (status) { values.push(status); conditions.push(`u.account_status = $${values.length}`); }
      const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
      const from = `FROM hrmss.${UserAccountModel.table} u JOIN hrmss.${RoleModel.table} r ON r.role_id = u.role_id
        LEFT JOIN hrmss.${UserInformationModel.table} i ON i.user_id = u.user_id`;
      
        // Một câu SQL giúp tổng số và trang dữ liệu dùng cùng ảnh chụp, kể cả khi trang rỗng.
      const { rows: [result] } = await db.query(`WITH filtered AS (
          SELECT ${publicColumns}, i.full_name, i.phone ${from} ${where}
        ), page_rows AS (
          SELECT * FROM filtered ORDER BY user_id::bigint DESC
          LIMIT $${values.length + 1} OFFSET $${values.length + 2}
        ) SELECT (SELECT count(*)::text FROM filtered) AS total,
          COALESCE((SELECT json_agg(page_rows ORDER BY user_id::bigint DESC) FROM page_rows), '[]'::json) AS items`,
        [...values, limit, (page - 1) * limit]);
      return { items: result.items, total: result.total };
    },
  };
}
