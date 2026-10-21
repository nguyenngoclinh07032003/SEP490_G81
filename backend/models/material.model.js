import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const MaterialModel = createReadModel({
  table: 'material',
  primaryKey: ["material_id"],
  columns: [
    'material_id',
    'material_name',
    'unit_of_measure',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default MaterialModel;
