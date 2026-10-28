import createReadModel from './readModel.js';

// Mô tả trạng thái vị trí; ẩn tọa độ và thông tin chia sẻ khỏi truy vấn đọc chung.
const UserLocationStateModel = createReadModel({
  table: 'user_location_state',
  primaryKey: ["user_id"],
  columns: [
    'user_id',
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
  hiddenColumns: ["location_sharing_enabled", "latitude", "longitude", "location_accuracy", "location_recorded_at", "location_received_at", "location_session_expires_at", "location_state_version"],
});

export default UserLocationStateModel;
