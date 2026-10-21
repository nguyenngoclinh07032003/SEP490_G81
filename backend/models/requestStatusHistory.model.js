import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const RequestStatusHistoryModel = createReadModel({
  table: 'request_status_history',
  primaryKey: ["history_id"],
  columns: [
    'history_id',
    'changed_by',
    'request_id',
    'previous_status',
    'new_status',
    'changed_at',
    'reason',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default RequestStatusHistoryModel;
