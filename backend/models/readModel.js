import pool from '../config/database.js';

// Tạo model CRUD dùng chung cho PostgreSQL; có thể truyền connection của transaction.
export default function createReadModel({ table, primaryKey, columns, generatedColumns = [], hiddenColumns = [] }) {
  // Bọc tên bảng/cột bằng double-quote theo chuẩn PostgreSQL.
  const quote = (name) => `"${name}"`;
  // Loại cột bị ẩn khỏi kết quả.
  const visibleColumns = columns.filter((column) => !hiddenColumns.includes(column));
  const projection = visibleColumns.map(quote).join(', ');

  // Tạo WHERE với giá trị truyền qua tham số ($1, $2, ... cho PostgreSQL).
  function whereClause(filters, startParamIndex = 1) {
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
      return `${quote(column)} = $${startParamIndex + values.length - 1}`;
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

    // Tìm một bản ghi đầu tiên thỏa mãn bộ lọc.
    async findOne(filters = {}, connection = pool) {
      const { sql, values } = whereClause(filters);
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
      const { rows } = await connection.query(
        `SELECT ${projection} FROM ${quote(table)}${sql} ORDER BY ${order} LIMIT ${limit} OFFSET ${offset}`,
        values,
      );
      return rows;
    },

    // Tạo bản ghi mới (INSERT)
    async create(data, connection = pool) {
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new TypeError('Data must be an object');
      }
      const insertColumns = Object.keys(data).filter((col) => columns.includes(col) && !generatedColumns.includes(col));
      if (!insertColumns.length) {
        throw new TypeError('No valid columns provided for insert');
      }
      const values = insertColumns.map((col) => data[col]);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      const colNames = insertColumns.map(quote).join(', ');
      const { rows } = await connection.query(
        `INSERT INTO ${quote(table)} (${colNames}) VALUES (${placeholders}) RETURNING ${projection}`,
        values,
      );
      return rows[0];
    },

    // Cập nhật bản ghi theo khóa chính (UPDATE)
    async update(id, data, connection = pool) {
      const keys = primaryKey.length === 1 ? { [primaryKey[0]]: id } : id;
      const updateColumns = Object.keys(data).filter((col) => columns.includes(col) && !primaryKey.includes(col) && !generatedColumns.includes(col));
      if (!updateColumns.length) {
        throw new TypeError('No valid columns provided for update');
      }
      const values = [];
      const setClauses = updateColumns.map((col) => {
        values.push(data[col]);
        return `${quote(col)} = $${values.length}`;
      });
      const whereParts = Object.entries(keys).map(([col, val]) => {
        values.push(val);
        return `${quote(col)} = $${values.length}`;
      });
      const { rows } = await connection.query(
        `UPDATE ${quote(table)} SET ${setClauses.join(', ')} WHERE ${whereParts.join(' AND ')} RETURNING ${projection}`,
        values,
      );
      return rows[0] ?? null;
    },

    // Xóa bản ghi theo khóa chính (DELETE)
    async delete(id, connection = pool) {
      const keys = primaryKey.length === 1 ? { [primaryKey[0]]: id } : id;
      const values = [];
      const whereParts = Object.entries(keys).map(([col, val]) => {
        values.push(val);
        return `${quote(col)} = $${values.length}`;
      });
      const { rowCount } = await connection.query(
        `DELETE FROM ${quote(table)} WHERE ${whereParts.join(' AND ')}`,
        values,
      );
      return rowCount > 0;
    },
  });
}
