import createReadModel from './readModel.js';

// Mô tả bảng danh mục quyền và các cột được phép đọc.
const PermissionModel = createReadModel({
  table: 'permission',
  primaryKey: ["permission_id"],
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
