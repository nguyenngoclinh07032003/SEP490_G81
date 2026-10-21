import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const CollectionHandoverItemModel = createReadModel({
  table: 'collection_handover_item',
  primaryKey: ["handover_id","payment_id"],
  columns: [
    'created_at',
    'payment_id',
    'handover_id',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default CollectionHandoverItemModel;
