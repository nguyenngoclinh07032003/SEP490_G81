import { UserAccountModel, RoleModel, PermissionModel, RolePermissionModel } from '../models/index.js';
import { pool } from '../config/database.js';

// Tập hợp truy vấn vai trò và quyền; chỉ cấp quyền cho tài khoản ACTIVE.
export function createPermissionRepository(db = pool) {
  return {
    
    // Lấy các mã quyền hiện tại của tài khoản.
    async findPermissionsByUserId(userId) {
      const { rows } = await db.query(`SELECT p.permission_code
        FROM hrmss.${UserAccountModel.table} u
        JOIN hrmss.${RolePermissionModel.table} rp ON rp.role_id = u.role_id
        JOIN hrmss.${PermissionModel.table} p ON p.permission_id = rp.permission_id
        WHERE u.user_id = $1 AND u.account_status = 'ACTIVE'
        ORDER BY p.permission_code`, [userId]);
      return rows.map(row => row.permission_code);
    },
    
    // Kiểm tra tài khoản ACTIVE có quyền cụ thể hay không.
    async hasPermission(userId, permissionCode) {
      const { rows: [result] } = await db.query(`SELECT EXISTS (
        SELECT 1 FROM hrmss.${UserAccountModel.table} u
        JOIN hrmss.${RolePermissionModel.table} rp ON rp.role_id = u.role_id
        JOIN hrmss.${PermissionModel.table} p ON p.permission_id = rp.permission_id
        WHERE u.user_id = $1 AND u.account_status = 'ACTIVE' AND p.permission_code = $2
      ) AS allowed`, [userId, permissionCode]);
      return result.allowed;
    },
    
    // Lấy danh mục vai trò theo thứ tự ID.
    async listRoles() {
      const { rows } = await db.query(`SELECT role_id::text, role_code, role_name, description
        FROM hrmss.${RoleModel.table} ORDER BY role_id`);
      return rows;
    },
  };
}
