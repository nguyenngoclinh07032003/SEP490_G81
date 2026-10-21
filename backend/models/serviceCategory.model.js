import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const ServiceCategoryModel = createReadModel({
  table: 'service_category',
  primaryKey: ["category_id"],
  columns: [
    'category_id',
    'category_name',
    'description',
    'is_active',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default ServiceCategoryModel;
