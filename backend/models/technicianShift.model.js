import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const TechnicianShiftModel = createReadModel({
  table: 'technician_shift',
  primaryKey: ["shift_id"],
  columns: [
    'shift_id',
    'technician_id',
    'starts_at',
    'ends_at',
    'shift_status',
    'status_reason',
    'created_by',
    'updated_by',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default TechnicianShiftModel;
