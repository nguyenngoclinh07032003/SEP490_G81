import createReadModel from './readModel.js';

// Mô tả liên kết vai trò–quyền với khóa chính gồm hai cột.
const RolePermissionModel = createReadModel({
  table: 'role_permission',
  primaryKey: ["role_id", "permission_id"],
  columns: [
    'role_id',
    'permission_id',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default RolePermissionModel;
