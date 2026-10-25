import createReadModel from './readModel.js';

// Model user_information: Hồ sơ cá nhân và thông tin định vị GPS của người dùng.
const UserInformationModel = createReadModel({
  table: 'user_information',
  primaryKey: ['user_info_id'],
  columns: [
    'user_info_id',
    'user_id',
    'full_name',
    'phone',
    'ava_storage_reference',
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
  // Ẩn tọa độ chi tiết và version khỏi truy vấn thông thường.
  hiddenColumns: [
    'latitude',
    'longitude',
    'location_accuracy',
    'location_recorded_at',
    'location_received_at',
    'location_session_expires_at',
    'location_state_version',
  ],
});

export default UserInformationModel;
