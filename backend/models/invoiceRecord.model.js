import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const InvoiceRecordModel = createReadModel({
  table: 'invoice_record',
  primaryKey: ["invoice_id"],
  columns: [
    'invoice_id',
    'recorded_by',
    'request_id',
    'invoice_reference',
    'issued_date',
    'invoice_amount',
    'invoice_status',
    'notes',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default InvoiceRecordModel;
