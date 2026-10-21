import createReadModel from './readModel.js';

// Cấu hình model theo bảng trong schema.
const QuotationItemModel = createReadModel({
  table: 'quotation_item',
  primaryKey: ["quotation_item_id"],
  columns: [
    'quotation_item_id',
    'material_id',
    'request_service_id',
    'quotation_id',
    'item_type',
    'description_snapshot',
    'quantity',
    'unit_price',
    'created_at',
    'updated_at',
  ],
  generatedColumns: [],
  hiddenColumns: [],
});

export default QuotationItemModel;
