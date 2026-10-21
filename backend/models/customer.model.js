import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const CustomerModel = createReadModel({
  table: 'customer',
  primaryKey: ["customer_id"],
  columns: [
    'customer_id',
    'user_id',
    'customer_name',
    'phone',
    'email',
    'notes',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default CustomerModel;
