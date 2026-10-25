import createReadModel from './readModel.js';

// Model user_account: Thông tin đăng nhập, xác thực và trạng thái tài khoản.
const UserAccountModel = createReadModel({
  table: 'user_account',
  primaryKey: ['user_id'],
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
  // Ẩn mật khẩu băm khỏi truy vấn chung.
  hiddenColumns: ['password_hash'],
});

export default UserAccountModel;
