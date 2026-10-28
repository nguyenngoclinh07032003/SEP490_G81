// Chỉ chọn các trường tài khoản công khai; không trả password_hash từ dữ liệu DB.
export function toPublicAccount(row) {
  if (!row) return null;
  return {
    user_id: row.user_id, username: row.username, email: row.email,
    account_status: row.account_status,
    role: { role_id: row.role_id, role_code: row.role_code, role_name: row.role_name },
    created_at: row.created_at, updated_at: row.updated_at,
  };
}

// Chọn các trường hồ sơ được phép trả cho client.
export function toPublicProfile(row) {
  if (!row) return null;
  return {
    user_id: row.user_id, full_name: row.full_name, phone: row.phone,
    ava_storage_reference: row.ava_storage_reference,
    created_at: row.created_at, updated_at: row.updated_at,
  };
}
