import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const MaterialUsageModel = createReadModel({
  table: 'material_usage',
  primaryKey: ["usage_id"],
  columns: [
    'usage_id',
    'recorded_by',
    'material_id',
    'visit_id',
    'used_quantity',
    'recorded_at',
    'notes',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default MaterialUsageModel;
