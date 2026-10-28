// Lệnh cục bộ tạo ADMIN đầu tiên trong Development/Test; không ghi đè tài khoản hiện có.
import { env } from '../src/config/env.js';
import { pool } from '../src/config/database.js';
import { internalAccountSchema } from '../src/validators/auth.validator.js';
import { createUserRepository } from '../src/repositories/user.repository.js';
import { withTransaction } from '../src/repositories/transaction.js';
import { hashPassword } from '../src/utils/password.js';
try {
  if (!['development', 'test'].includes(env.NODE_ENV)) throw new Error('Bootstrap only allowed in Development/Test.');
  const input = internalAccountSchema.parse({ username: process.env.BOOTSTRAP_USERNAME,
    email: process.env.BOOTSTRAP_EMAIL, full_name: process.env.BOOTSTRAP_FULL_NAME,
    password: process.env.BOOTSTRAP_PASSWORD, confirm_password: process.env.BOOTSTRAP_PASSWORD, role: 'ADMIN' });
  const passwordHash = await hashPassword(input.password);
  await withTransaction(async client => {
    // Khóa tư vấn trong transaction để hai lần bootstrap không cùng tạo ADMIN đầu tiên.
    await client.query("SELECT pg_advisory_xact_lock(490302)");
    const { rows: [existing] } = await client.query(`SELECT EXISTS(SELECT 1 FROM hrmss.user_account u
      JOIN hrmss.role r ON r.role_id=u.role_id WHERE r.role_code='ADMIN') AS present`);
    if (existing.present) throw new Error('ADMIN already exists. Use the authenticated account management API.');
    const users = createUserRepository(client);
    const id = await users.insertAccount({username:input.username,email:input.email,passwordHash,roleCode:'ADMIN'});
    if (!id) throw new Error('ADMIN role missing; apply database.sql first.');
    await users.insertProfile({userId:id,full_name:input.full_name,phone:null});
  });
  console.log('First ADMIN created. Password is not printed.');
} catch (error) {
  console.error(error.name === 'ZodError' ? 'Invalid BOOTSTRAP_* input.' : (error.code || error.message));
  process.exitCode = 1;
} finally { await pool.end(); }
