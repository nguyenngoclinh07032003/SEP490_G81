import createReadModel from './readModel.js';

// Model user_location_state: Toạ độ định vị GPS realtime mới nhất của thợ (1:1 với user_account)
const UserLocationStateModel = createReadModel({
  table: 'user_location_state',
  primaryKey: ['user_id'],
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
  hiddenColumns: [],
});

export default UserLocationStateModel;
