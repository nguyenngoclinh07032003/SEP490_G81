import { pool } from '../config/database.js';

// Tạo truy vấn đọc chung từ cấu hình model; chỉ lấy cột công khai.
// Tên bảng/cột lấy từ code và được kiểm tra; giá trị lọc luôn truyền qua tham số SQL.
export default function createReadRepository({ table, primaryKey, columns,
  generatedColumns = [], hiddenColumns = [] }, db = pool) {

  // Kiểm tra và bao tên bảng/cột hợp lệ; tên định danh SQL không dùng được tham số $1.
  const quote = name => {
    if (!/^[a-z_][a-z0-9_]*$/.test(name)) throw new TypeError('Invalid SQL identifier');
    return `"${name}"`;
  };
  const source = `"hrmss".${quote(table)}`;
  columns.forEach(quote);
  if (!primaryKey.length || [...primaryKey, ...generatedColumns, ...hiddenColumns].some(c => !columns.includes(c))) {
    throw new TypeError('Invalid model column configuration');
  }
  const visible = columns.filter(c => !hiddenColumns.includes(c));
  if (!visible.length) throw new TypeError('Model needs visible columns');
  const projection = visible.map(quote).join(', ');

  // Ghép điều kiện WHERE và danh sách tham số; xử lý riêng NULL, từ chối cột ẩn/lạ.
  function predicate(where) {
    const values = [];
    const clauses = Object.entries(where).map(([key, value]) => {
      if (!visible.includes(key)) throw new TypeError('Unknown or hidden filter column');
      if (value === null) return `${quote(key)} IS NULL`;
      if (value === undefined) throw new TypeError('Undefined filter value');
      values.push(value);
      return `${quote(key)} = $${values.length}`;
    });
    return { values, sql: clauses.length ? ' WHERE ' + clauses.join(' AND ') : '' };
  }
  return Object.freeze({
    table, primaryKey: Object.freeze([...primaryKey]), columns: Object.freeze([...columns]),
    generatedColumns: Object.freeze([...generatedColumns]), hiddenColumns: Object.freeze([...hiddenColumns]),

    // Tìm một bản ghi theo đầy đủ khóa chính, hỗ trợ cả khóa ghép.
    async findById(id) {
      const key = primaryKey.length === 1 ? { [primaryKey[0]]: id } : id;
      if (!key || typeof key !== 'object' || Object.keys(key).length !== primaryKey.length
        || primaryKey.some(c => key[c] === undefined || key[c] === null)) throw new TypeError('Complete primary key required');
      const { sql, values } = predicate(key);
      const { rows } = await db.query(`SELECT ${projection} FROM ${source}${sql}`, values);
      return rows[0] ?? null;
    },
    
    // Đọc danh sách có điều kiện và phân trang theo thứ tự khóa chính.
    async findAll({ where = {}, limit = 20, offset = 0 } = {}) {
      if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100
        || !Number.isSafeInteger(offset) || offset < 0) throw new RangeError('Invalid pagination');
      const { sql, values } = predicate(where);
      const { rows } = await db.query(`SELECT ${projection} FROM ${source}${sql}
        ORDER BY ${primaryKey.map(quote).join(', ')}
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, limit, offset]);
      return rows;
    },
  });
}
