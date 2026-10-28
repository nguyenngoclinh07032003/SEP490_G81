import pool from '../config/database.js';

/**
 * ==============================================================================
 * DỊCH VỤ MINH ĐỨC - USER REPOSITORY (TẦNG TRUY VẤN CƠ SỞ DỮ LIỆU)
 * ==============================================================================
 * Nhiệm vụ:
 * - Đóng gói toàn bộ các câu lệnh SQL truy vấn và ghi dữ liệu người dùng
 * - Tái sử dụng các câu query JOIN phức tạp, tránh lặp lại mã nguồn
 * - Dễ dàng bảo trì, mở rộng và thay đổi schema cơ sở dữ liệu sau này
 */
class UserRepository {
  /**
   * Tìm người dùng phục vụ xác thực đăng nhập (kèm thông tin vai trò và mật khẩu băm)
   * Tìm linh hoạt theo Username hoặc Email
   */
  async findByIdentifierForAuth(identifier) {
    const isEmail = identifier.includes('@');
    const queryField = isEmail ? 'u.email = $1' : 'u.username = $1';

    const sql = `
      SELECT u.user_id, u.role_id, u.username, u.password_hash, u.email, u.account_status,
             r.role_code, r.role_name,
             info.full_name, info.phone, info.ava_storage_reference
      FROM user_account u
      JOIN role r ON u.role_id = r.role_id
      LEFT JOIN user_information info ON u.user_id = info.user_id
      WHERE ${queryField}
      LIMIT 1
    `;

    const res = await pool.query(sql, [identifier]);
    return res.rows[0] || null;
  }

  /**
   * Lấy hồ sơ tài khoản đầy đủ (User Account + Role + User Info + Location State)
   * Phục vụ API /me và hiển thị hồ sơ cá nhân
   */
  async findFullProfileById(userId) {
    const sql = `
      SELECT u.user_id, u.username, u.email, u.account_status, u.created_at,
             r.role_code, r.role_name,
             info.full_name, info.phone, info.ava_storage_reference,
             loc.location_sharing_enabled, loc.latitude, loc.longitude
      FROM user_account u
      JOIN role r ON u.role_id = r.role_id
      LEFT JOIN user_information info ON u.user_id = info.user_id
      LEFT JOIN user_location_state loc ON u.user_id = loc.user_id
      WHERE u.user_id = $1
      LIMIT 1
    `;

    const res = await pool.query(sql, [userId]);
    return res.rows[0] || null;
  }

  /**
   * Kiểm tra thông tin cơ bản và trạng thái hoạt động của tài khoản theo ID
   * Phục vụ quy trình xoay vòng Token (Refresh Token)
   */
  async findAccountStatusById(userId) {
    const sql = `
      SELECT u.user_id, u.role_id, u.username, u.email, u.account_status,
             r.role_code, r.role_name
      FROM user_account u
      JOIN role r ON u.role_id = r.role_id
      WHERE u.user_id = $1
      LIMIT 1
    `;

    const res = await pool.query(sql, [userId]);
    return res.rows[0] || null;
  }

  /**
   * Lấy danh sách mã quyền hạn (permission_code) theo role_id từ RBAC
   */
  async getPermissionsByRoleId(roleId) {
    const sql = `
      SELECT p.permission_code
      FROM role_permission rp
      JOIN permission p ON rp.permission_id = p.permission_id
      WHERE rp.role_id = $1
    `;

    const res = await pool.query(sql, [roleId]);
    return res.rows.map((row) => row.permission_code);
  }

  /**
   * Kiểm tra xem Username hoặc Email đã tồn tại trong hệ thống hay chưa
   */
  async checkDuplicate(username, email) {
    const sql = `
      SELECT user_id, username, email
      FROM user_account
      WHERE username = $1 OR (email IS NOT NULL AND email = $2)
      LIMIT 1
    `;

    const res = await pool.query(sql, [username, email]);
    return res.rows[0] || null;
  }

  /**
   * Lấy role_id dựa vào role_code
   */
  async getRoleIdByCode(roleCode) {
    const sql = 'SELECT role_id FROM role WHERE role_code = $1 LIMIT 1';
    const res = await pool.query(sql, [roleCode]);
    return res.rows[0]?.role_id || null;
  }

  /**
   * Thực hiện Transaction tạo tài khoản Khách hàng mới:
   * Ghi đồng thời: user_account + user_information + customer
   */
  async createCustomerUserTransaction({ roleId, username, passwordHash, email, fullName, phone }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Tạo user_account
      const newUserRes = await client.query(
        `INSERT INTO user_account (role_id, username, password_hash, email, account_status)
         VALUES ($1, $2, $3, $4, 'ACTIVE')
         RETURNING user_id, role_id, username, email, account_status, created_at`,
        [roleId, username, passwordHash, email],
      );
      const newUser = newUserRes.rows[0];

      // 2. Tạo user_information
      const newProfileRes = await client.query(
        `INSERT INTO user_information (user_id, full_name, phone)
         VALUES ($1, $2, $3)
         RETURNING user_id, full_name, phone`,
        [newUser.user_id, fullName.trim(), phone.trim()],
      );
      const newProfile = newProfileRes.rows[0];

      // 3. Tạo customer
      await client.query(
        `INSERT INTO customer (user_id, customer_name, phone, email)
         VALUES ($1, $2, $3, $4)`,
        [newUser.user_id, fullName.trim(), phone.trim(), email],
      );

      await client.query('COMMIT');

      return {
        userId: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        fullName: newProfile.full_name,
        phone: newProfile.phone,
        role: 'CUSTOMER',
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

export const userRepository = new UserRepository();
export default userRepository;
