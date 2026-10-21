import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const ReceivableFollowUpModel = createReadModel({
  table: 'receivable_follow_up',
  primaryKey: ["follow_up_id"],
  columns: [
    'follow_up_id',
    'recorded_by',
    'request_id',
    'follow_up_at',
    'collection_outcome',
    'payment_commitment',
    'promised_payment_date',
    'notes',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default ReceivableFollowUpModel;
