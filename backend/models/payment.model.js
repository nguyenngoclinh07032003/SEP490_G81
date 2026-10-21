import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const PaymentModel = createReadModel({
  table: 'payment',
  primaryKey: ["payment_id"],
  columns: [
    'payment_id',
    'recorded_by',
    'received_by',
    'request_id',
    'amount',
    'payment_method',
    'payment_channel',
    'paid_at',
    'payment_status',
    'transaction_reference',
    'notes',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default PaymentModel;
