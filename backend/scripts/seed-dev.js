import fs from 'node:fs/promises';
import pg from 'pg';
import { fileURLToPath } from 'node:url';
import { env } from '../src/config/env.js';
import { hashPassword, verifyPassword } from '../src/utils/password.js';
// Chỉ seed hai DB development đã cho phép; đọc fixture từ .local và không ghi đè dữ liệu khác.
const dbName = process.argv[2] ?? env.DB_NAME;
if (!['development','test'].includes(env.NODE_ENV) || env.DB_HOST!=='127.0.0.1'
  || env.DB_PORT!==5432 || !['hrmss','hrmss_auth'].includes(dbName)) throw new Error('Seed restricted to new local Development databases.');
const accounts=JSON.parse(await fs.readFile(fileURLToPath(new URL('../../.local/dev-accounts.json',import.meta.url)),'utf8'));
const client=new pg.Client({host:env.DB_HOST,port:env.DB_PORT,user:env.DB_USER,password:env.DB_PASSWORD,database:dbName});
try {
 // Chạy seed trong một transaction và khóa tư vấn để tránh hai lần seed đồng thời.
 await client.connect();await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(490303)');
 const {rows:roles}=await client.query('SELECT role_id::text,role_code FROM hrmss.role');
 if(roles.length!==accounts.length || roles.some(r=>!accounts.some(a=>a.role===r.role_code)))throw new Error('Role catalog differs from approved fixtures');
 let created=0,profiles=0,locations=0,customers=0;
 for(const a of accounts){
  const role=roles.find(r=>r.role_code===a.role);
  let {rows:[user]}=await client.query('SELECT user_id::text,role_id::text,email,password_hash FROM hrmss.user_account WHERE username=$1',[a.username]);
  // Nếu tài khoản đã có thì đối chiếu fixture; khác dữ liệu sẽ dừng thay vì cập nhật.
  if(user){if(user.role_id!==role.role_id||user.email!==a.email||!await verifyPassword(a.password,user.password_hash))throw new Error('Existing data differs, refusing overwrite: '+a.username);}
  else{const result=await client.query('INSERT INTO hrmss.user_account(role_id,username,email,password_hash) VALUES($1,$2,$3,$4) RETURNING user_id::text',[role.role_id,a.username,a.email,await hashPassword(a.password)]);user=result.rows[0];created++;}
  // Chỉ bổ sung hồ sơ/vị trí/customer còn thiếu; chạy lại không tạo bản ghi trùng.
  profiles+=(await client.query('INSERT INTO hrmss.user_information(user_id,full_name,phone) VALUES($1,$2,$3) ON CONFLICT(user_id) DO NOTHING',[user.user_id,a.full_name,'0900000000'])).rowCount;
  if(a.role==='TECHNICIAN')locations+=(await client.query('INSERT INTO hrmss.user_location_state(user_id) VALUES($1) ON CONFLICT(user_id) DO NOTHING',[user.user_id])).rowCount;
  if(a.role==='CUSTOMER'&&(await client.query("SELECT to_regclass('hrmss.customer') t")).rows[0].t){
   customers+=(await client.query('INSERT INTO hrmss.customer(user_id,customer_name,phone,email) VALUES($1,$2,$3,$4) ON CONFLICT(user_id) DO NOTHING',[user.user_id,a.full_name,'0900000000',a.email])).rowCount;
  }
 }
 await client.query('COMMIT');console.log(JSON.stringify({database:dbName,created,skipped:accounts.length-created,profiles,locations,customers}));
}catch(e){await client.query('ROLLBACK').catch(()=>{});console.error(e.code||e.message);process.exitCode=1;}
finally{await client.end();}
