import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const ServiceRequestModel = createReadModel({
  table: 'service_request',
  primaryKey: ["request_id"],
  columns: [
    'request_id',
    'created_by',
    'customer_id',
    'original_request_id',
    'request_type',
    'warranty_start_date',
    'warranty_end_date',
    'request_code',
    'problem_description',
    'service_address_snapshot',
    'contact_name_snapshot',
    'contact_phone_snapshot',
    'preferred_time',
    'request_status',
    'payment_due_date',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default ServiceRequestModel;
