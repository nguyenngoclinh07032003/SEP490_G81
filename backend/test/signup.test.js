import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import pg from 'pg';
import { createApp } from '../src/app.js';
import { createAuthService } from '../src/services/auth.service.js';
import { createUserRepository } from '../src/repositories/user.repository.js';
import { hashPassword, verifyPassword } from '../src/utils/password.js';

const input={username:'signup_test',email:'signup_test@example.com',password:'SamplePass123!',confirm_password:'SamplePass123!',full_name:'Test Customer'};
// Khởi chạy API ở cổng ngẫu nhiên để test và luôn đóng server sau khi kết thúc.
async function withApi(service, run) {
 const server=createApp({authService:service}).listen(0,'127.0.0.1');await once(server,'listening');
 const post=body=>fetch(`http://127.0.0.1:${server.address().port}/api/v1/auth/signup`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 try{await run(post);}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
}
test('signup rejects role injection and mismatched passwords before service',async()=>{
 await withApi({signup(){throw Error('must not call');}},async post=>{
  for(const body of [{...input,role:'ADMIN'},{...input,account_status:'ACTIVE'},{...input,confirm_password:'different'},{...input,password:'short',confirm_password:'short'}]) {
   const response=await post(body);assert.equal(response.status,400);assert.equal((await response.json()).code,'VALIDATION_ERROR');
  }
 });
});
test('password hash is salted and verifies without trimming the password',async()=>{
 const hash=await hashPassword(' Password123 ');
 assert.equal(await verifyPassword(' Password123 ',hash),true);
 assert.equal(await verifyPassword('Password123',hash),false);
 assert.equal(await verifyPassword('wrong','bad-format'),false);
 assert.notEqual(await hashPassword(' Password123 '),hash);
});
test('signup HTTP + PostgreSQL commit, unique conflict and rollback', {skip:!process.env.PG_TEST_DATABASE_URL},async()=>{
 const db=new pg.Client({connectionString:process.env.PG_TEST_DATABASE_URL});await db.connect();
 const transaction=async work=>{await db.query('BEGIN');try{const result=await work(db);await db.query('COMMIT');return result;}catch(error){await db.query('ROLLBACK');throw error;}};
 const service=createAuthService({transaction});
 try{
  await withApi(service,async post=>{
   const response=await post({...input,username:' SIGNUP_TEST ',email:' SIGNUP_TEST@EXAMPLE.COM '});
   assert.equal(response.status,201);const body=await response.json();
   assert.equal(body.data.account.username,'signup_test');assert.equal(body.data.account.role.role_code,'CUSTOMER');
   assert.ok(!JSON.stringify(body).includes('password_hash'));assert.ok(!JSON.stringify(body).includes(input.password));
   const {rows:[account]}=await db.query("SELECT password_hash FROM hrmss.user_account WHERE username=$1",[input.username]);
   assert.equal(await verifyPassword(input.password,account.password_hash),true);
   for(const data of [input,{...input,email:'other@example.com'},{...input,username:'other_username'}]){
    const conflict=await post(data);assert.equal(conflict.status,409);assert.equal((await conflict.json()).code,'ACCOUNT_ALREADY_EXISTS');
   }
  });
  const broken=createAuthService({transaction,repository:client=>{
   const repo=createUserRepository(client);
   return {...repo,insertProfile:data=>repo.insertProfile({...data,full_name:'x'.repeat(201)})};
  }});
  await assert.rejects(broken.signup({...input,username:'signup_rollback',email:'rollback@example.com'}));
  const {rows:[count]}=await db.query("SELECT count(*) FROM hrmss.user_account WHERE username='signup_rollback'");
  assert.equal(count.count,'0');
 }finally{
  await db.query("DELETE FROM hrmss.user_account WHERE username IN ('signup_test','signup_rollback','other_username')");await db.end();
 }
});
