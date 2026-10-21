import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const AttachmentModel = createReadModel({
  table: 'attachment',
  primaryKey: ["attachment_id"],
  columns: [
    'attachment_id',
    'evidence_type',
    'invoice_id',
    'acceptance_id',
    'visit_id',
    'diagnosis_id',
    'request_id',
    'uploaded_by',
    'original_file_name',
    'storage_reference',
    'mime_type',
    'file_size',
    'description',
    'uploaded_at',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default AttachmentModel;
