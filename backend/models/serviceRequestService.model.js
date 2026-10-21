import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const ServiceRequestServiceModel = createReadModel({
  table: 'service_request_service',
  primaryKey: ["request_service_id"],
  columns: [
    'request_service_id',
    'service_id',
    'request_id',
    'service_name_snapshot',
    'selected_price',
    'notes',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default ServiceRequestServiceModel;
