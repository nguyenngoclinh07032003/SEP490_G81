import createReadModel from './readModel.js';

// Mô tả bảng vai trò; mỗi tài khoản tham chiếu một vai trò.
const RoleModel = createReadModel({
  table: 'role',
  primaryKey: ["role_id"],
  columns: [
    'role_id',
    'role_code',
    'role_name',
    'description',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default RoleModel;
