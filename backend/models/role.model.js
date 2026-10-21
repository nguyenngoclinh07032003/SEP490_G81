import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
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
