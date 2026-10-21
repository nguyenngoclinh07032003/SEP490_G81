import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const CollectionHandoverModel = createReadModel({
  table: 'collection_handover',
  primaryKey: ["handover_id"],
  columns: [
    'handover_id',
    'confirmed_by',
    'technician_id',
    'submitted_at',
    'handover_status',
    'confirmed_at',
    'notes',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default CollectionHandoverModel;
