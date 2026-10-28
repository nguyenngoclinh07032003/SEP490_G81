import createReadModel from './readModel.js';

// Model role_permission: Ánh xạ nhiều - nhiều giữa Vai trò và Quyền (RBAC Mapping)
const RolePermissionModel = createReadModel({
  table: 'role_permission',
  primaryKey: ['role_id', 'permission_id'],
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
