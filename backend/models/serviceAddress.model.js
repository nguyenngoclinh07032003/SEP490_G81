import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const ServiceAddressModel = createReadModel({
  table: 'service_address',
  primaryKey: ["address_id"],
  columns: [
    'address_id',
    'customer_id',
    'address_text',
    'contact_name',
    'contact_phone',
    'is_default',
    'default_customer_id',
    'created_at',
    'updated_at',
  ],
  // Cột do DB tự tính (Generated Column).
  generatedColumns: ["default_customer_id"],
  hiddenColumns: [],
});

export default ServiceAddressModel;
