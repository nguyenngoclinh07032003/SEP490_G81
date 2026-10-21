import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const TechnicianSpecialtyModel = createReadModel({
  table: 'technician_specialty',
  primaryKey: ["technician_id","category_id"],
  columns: [
    'technician_id',
    'category_id',
    'maintained_by',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default TechnicianSpecialtyModel;
