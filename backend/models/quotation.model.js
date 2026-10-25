import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const QuotationModel = createReadModel({
  table: 'quotation',
  primaryKey: ["quotation_id"],
  columns: [
    'quotation_id',
    'decision_recorded_by',
    'created_by',
    'request_id',
    'quotation_code',
    'quotation_type',
    'quotation_status',
    'total_amount',
    'sent_at',
    'customer_decision',
    'decided_at',
    'decision_method',
    'rejection_reason',
    'created_at',
    'updated_at',
    'initial_request_id',
  ],
  // Cột do DB tự tính (Generated Column).
  generatedColumns: ["initial_request_id"],
  hiddenColumns: [],
});

export default QuotationModel;
