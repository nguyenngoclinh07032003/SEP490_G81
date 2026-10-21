import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const RepairResultReviewModel = createReadModel({
  table: 'repair_result_review',
  primaryKey: ["review_id"],
  columns: [
    'review_id',
    'reviewed_by',
    'visit_id',
    'reviewed_at',
    'review_outcome',
    'correction_request',
    'review_notes',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default RepairResultReviewModel;
