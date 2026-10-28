import createReadModel from './readModel.js';

// Model permission: Danh mục các quyền hạt nhân trong hệ thống (Granular RBAC)
const PermissionModel = createReadModel({
  table: 'permission',
  primaryKey: ['permission_id'],
  columns: [
    'permission_id',
    'permission_code',
    'description',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default PermissionModel;
