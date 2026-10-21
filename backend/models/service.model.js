import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const ServiceModel = createReadModel({
  table: 'service',
  primaryKey: ["service_id"],
  columns: [
    'service_id',
    'category_id',
    'service_name',
    'description',
    'base_price',
    'is_active',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default ServiceModel;
