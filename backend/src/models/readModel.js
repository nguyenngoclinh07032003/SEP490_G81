// Kiểm tra và đóng băng mô tả bảng/cột; model không chứa SQL, kết nối hay thao tác CRUD.
export default function createReadModel({ table, primaryKey, columns,
  generatedColumns = [], hiddenColumns = [] }) {
  const valid = name => typeof name === 'string' && /^[a-z_][a-z0-9_]*$/.test(name);
  if (!valid(table) || !columns.length || !columns.every(valid)
    || new Set(columns).size !== columns.length || !primaryKey.length
    || [...primaryKey, ...generatedColumns, ...hiddenColumns].some(c => !columns.includes(c))) {
    throw new TypeError('Invalid model configuration');
  }
  if (!columns.some(c => !hiddenColumns.includes(c))) throw new TypeError('Model needs visible columns');
  return Object.freeze({
    table, primaryKey: Object.freeze([...primaryKey]), columns: Object.freeze([...columns]),
    generatedColumns: Object.freeze([...generatedColumns]), hiddenColumns: Object.freeze([...hiddenColumns]),
  });
}
