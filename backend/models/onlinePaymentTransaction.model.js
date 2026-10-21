import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const OnlinePaymentTransactionModel = createReadModel({
  table: 'online_payment_transaction',
  primaryKey: ["online_transaction_id"],
  columns: [
    'online_transaction_id',
    'payment_id',
    'request_id',
    'provider',
    'provider_transaction_reference',
    'requested_amount',
    'transaction_status',
    'initiated_at',
    'confirmed_at',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default OnlinePaymentTransactionModel;
