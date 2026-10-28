import createReadModel from './readModel.js';

// Mô tả tài khoản; ẩn password_hash khỏi các truy vấn đọc chung.
const UserAccountModel = createReadModel({
  table: 'user_account',
  primaryKey: ["user_id"],
  columns: [
    'user_id',
    'role_id',
    'username',
    'email',
    'password_hash',
    'account_status',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: ["password_hash"],
});

export default UserAccountModel;
