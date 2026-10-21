import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const UserAccountModel = createReadModel({
  table: 'user_account',
  primaryKey: ["user_id"],
  columns: [
    'user_id',
    'role_id',
    'username',
    'password_hash',
    'full_name',
    'email',
    'phone',
    'ava_storage_reference',
    'account_status',
    'location_sharing_enabled',
    'latitude',
    'longitude',
    'location_accuracy',
    'location_recorded_at',
    'location_received_at',
    'location_session_expires_at',
    'location_state_version',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  // Ẩn thông tin nhạy cảm khỏi truy vấn chung.
  hiddenColumns: ["password_hash","latitude","longitude","location_accuracy","location_recorded_at","location_received_at","location_session_expires_at","location_state_version","location_sharing_enabled"],
});

export default UserAccountModel;
