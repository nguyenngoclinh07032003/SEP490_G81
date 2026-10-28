import fs from 'node:fs/promises';
import pg from 'pg';
import { randomBytes, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { env } from '../src/config/env.js';
import { pool } from '../src/config/database.js';
import { redis, connectRedis } from '../src/config/redis.js';
import { verifyPassword } from '../src/utils/password.js';
// Kiểm thử API đang chạy với PostgreSQL/Redis thật; dùng fixture tạm rồi dọn theo danh sách đã tạo.
const local=fileURLToPath(new URL('../../.local/',import.meta.url));
if(env.NODE_ENV!=='development'||env.DB_PORT!==5432||env.DB_NAME!=='hrmss_auth'||env.DB_HOST!=='127.0.0.1')throw Error('New local Development only');
const accounts=JSON.parse(await fs.readFile(local+'dev-accounts.json','utf8'));
const base=`http://127.0.0.1:${env.PORT}/api/v1`;const results=[],sessions=[],created=[];
const suffix=randomBytes(4).toString('hex');
// So sánh kết quả thực tế với kỳ vọng và ghi nhận kiểm tra thành công.
function check(name,actual,expected){if(actual!==expected)throw Error(name+': '+actual+' expected '+expected);results.push({name,actual,pass:true});}
// Gửi GET hoặc POST JSON, tùy chọn kèm Bearer token cho API cần xác thực.
async function req(path,token,body){return fetch(base+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});}
try {
 check('readiness',(await req('/health/ready')).status,200);
 check('guest denied',(await req('/admin/accounts',null,{})).status,401);
 let adminToken;
 const template={username:'probe_'+suffix,email:'probe_'+suffix+'@example.test',password:'Example123!',confirm_password:'Example123!',full_name:'Disposable verification',role:'ADMIN'};
 for(const a of accounts){
  const response=await req('/auth/login',null,{identifier:a.username,password:a.password});check(a.username+' login',response.status,200);
  const token=(await response.json()).data.access_token;sessions.push(token);
  const me=await req('/auth/me',token);check(a.username+' me',me.status,200);check(a.username+' role',(await me.json()).data.account.role.role_code,a.role);
  if(a.role==='ADMIN')adminToken=token;else check(a.username+' cannot create ADMIN',(await req('/admin/accounts',token,template)).status,403);
 }
 await connectRedis();const key='hrmss:auth:'+createHash('sha256').update(adminToken).digest('hex');
 const ttl=await redis.ttl(key);check('Redis TTL',ttl>0&&ttl<=900,true);
 for(const role of ['ADMIN','MANAGER','OFFICE_STAFF','TECHNICIAN']){
  const username='probe_'+role.toLowerCase()+'_'+suffix;
  const body={...template,username,email:username+'@example.test',role};
  const response=await req('/admin/accounts',adminToken,body);check('ADMIN creates '+role,response.status,201);created.push(username);
  check('created role '+role,(await response.json()).data.account.role.role_code,role);
  const login=await req('/auth/login',null,{identifier:username,password:body.password});check('created '+role+' login',login.status,200);sessions.push((await login.json()).data.access_token);
  check('duplicate '+role,(await req('/admin/accounts',adminToken,body)).status,409);
 }
 check('public role injection',(await req('/auth/signup',null,template)).status,400);
 const customer={...template,username:'probe_customer_'+suffix,email:'probe_customer_'+suffix+'@example.test'};delete customer.role;
 const signup=await req('/auth/signup',null,customer);check('public signup',signup.status,201);created.push(customer.username);
 check('default role CUSTOMER',(await signup.json()).data.account.role.role_code,'CUSTOMER');
 check('bad password',(await req('/auth/login',null,{identifier:'admin',password:'WrongPassword!'})).status,401);
 for(const token of sessions){check('logout',(await req('/auth/logout',token,{})).status,200);check('revoked session',(await req('/auth/me',token)).status,401);}
 await pool.query('DELETE FROM hrmss.user_account WHERE username=ANY($1::text[])',[created]);created.length=0;
 // Sau khi dọn fixture, kiểm tra số bảng/tài khoản và xác minh role/mật khẩu mẫu ở cả hai DB.
 const counts={};
 for(const name of ['hrmss','hrmss_auth']){
  const c=new pg.Client({host:env.DB_HOST,port:env.DB_PORT,user:env.DB_USER,password:env.DB_PASSWORD,database:name});
  try{await c.connect();counts[name]=(await c.query(`SELECT (SELECT count(*)::int FROM pg_tables WHERE schemaname='hrmss') tables,
   (SELECT count(*)::int FROM hrmss.user_account) accounts,(SELECT count(*)::int FROM hrmss.user_information) profiles,
   (SELECT count(*)::int FROM hrmss.user_location_state) locations`)).rows[0];
   check(name+' tables',counts[name].tables,name==='hrmss'?32:6);check(name+' 5 accounts',counts[name].accounts,5);
   for(const a of accounts){const {rows:[user]}=await c.query('SELECT u.password_hash,r.role_code FROM hrmss.user_account u JOIN hrmss.role r USING(role_id) WHERE username=$1',[a.username]);check(name+' '+a.username+' role',user.role_code,a.role);check(name+' '+a.username+' password',await verifyPassword(a.password,user.password_hash),true);}
  }finally{await c.end();}
 }
 await fs.writeFile(local+'dev-verification.json',JSON.stringify({base,counts,checks:results},null,2));
 console.log(JSON.stringify({base,counts,passed:results.length,failed:0}));
}finally{if(created.length)await pool.query('DELETE FROM hrmss.user_account WHERE username=ANY($1::text[])',[created]);await pool.end();if(redis.isOpen)await redis.quit();}
