import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const DiagnosisModel = createReadModel({
  table: 'diagnosis',
  primaryKey: ["diagnosis_id"],
  columns: [
    'diagnosis_id',
    'recorded_by',
    'visit_id',
    'symptoms',
    'findings',
    'repair_recommendation',
    'recorded_at',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default DiagnosisModel;
