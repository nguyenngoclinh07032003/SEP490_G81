import pool from '../config/database.js';

// Tạo model đọc dùng chung cho PostgreSQL; có thể truyền connection của transaction.
export default function createReadModel({ table, primaryKey, columns, generatedColumns = [], hiddenColumns = [] }) {
  // Bọc tên bảng/cột bằng double-quote theo chuẩn PostgreSQL.
  const quote = (name) => `"${name}"`;
  // Loại cột bị ẩn khỏi kết quả.
  const visibleColumns = columns.filter((column) => !hiddenColumns.includes(column));
  const projection = visibleColumns.map(quote).join(', ');

  // Tạo WHERE với giá trị truyền qua tham số ($1, $2, ... cho PostgreSQL).
  function whereClause(filters) {
    if (!filters || typeof filters !== 'object' || Array.isArray(filters)) {
      throw new TypeError('Filters must be an object');
    }
    const values = [];
    const clauses = Object.entries(filters).map(([column, value]) => {
      if (!columns.includes(column) || hiddenColumns.includes(column)) {
        throw new TypeError(`Unsupported filter: ${column}`);
      }
      if (value === null) return `${quote(column)} IS NULL`;
      if (!['string', 'number', 'boolean', 'bigint'].includes(typeof value) && !(value instanceof Date)) {
        throw new TypeError(`Invalid filter value: ${column}`);
      }
      values.push(value);
      return `${quote(column)} = $${values.length}`;
    });
    return { sql: clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '', values };
  }

  return Object.freeze({
    table,
    primaryKey: Object.freeze([...primaryKey]),
    columns: Object.freeze([...columns]),
    generatedColumns: Object.freeze([...generatedColumns]),
    hiddenColumns: Object.freeze([...hiddenColumns]),

    // Tìm theo khóa chính, trả bản ghi hoặc null.
    async findById(id, connection = pool) {
      const keys = primaryKey.length === 1 ? { [primaryKey[0]]: id } : id;
      if (!keys || typeof keys !== 'object' || Array.isArray(keys)
        || Object.keys(keys).length !== primaryKey.length
        || Object.keys(keys).some((key) => !primaryKey.includes(key))
        || primaryKey.some((key) => keys[key] === undefined || keys[key] === null)) {
        throw new TypeError('Provide every primary key field');
      }
      const { sql, values } = whereClause(keys);
      const { rows } = await connection.query(`SELECT ${projection} FROM ${quote(table)}${sql} LIMIT 1`, values);
      return rows[0] ?? null;
    },

    // Lấy danh sách có bộ lọc và phân trang.
    async findAll({ filters = {}, limit = 50, offset = 0 } = {}, connection = pool) {
      if (!Number.isSafeInteger(limit) || limit < 1 || limit > 200
        || !Number.isSafeInteger(offset) || offset < 0) {
        throw new RangeError('Limit must be 1..200 and offset must be a non-negative safe integer');
      }
      const { sql, values } = whereClause(filters);
      const order = primaryKey.map(quote).join(', ');
      // limit/offset đã được kiểm tra là số nguyên an toàn.
      const { rows } = await connection.query(
        `SELECT ${projection} FROM ${quote(table)}${sql} ORDER BY ${order} LIMIT ${limit} OFFSET ${offset}`,
        values,
      );
      return rows;
    },
  });
}
