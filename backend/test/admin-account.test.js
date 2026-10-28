import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import pg from 'pg';
import { createApp } from '../src/app.js';
import { createSessionService } from '../src/services/session.service.js';
import { createAdminAccountService } from '../src/services/admin-account.service.js';
import { createUserRepository } from '../src/repositories/user.repository.js';
import { hashPassword, verifyPassword } from '../src/utils/password.js';

test('admin account management, live authorization and session revocation', {skip:!process.env.PG_TEST_DATABASE_URL}, async()=>{
 const db=new pg.Client({connectionString:process.env.PG_TEST_DATABASE_URL});await db.connect();
 const transaction=async work=>{await db.query('BEGIN');try{const out=await work(db);await db.query('COMMIT');return out;}catch(e){await db.query('ROLLBACK');throw e;}};
 const sessionsMap=new Map();
 const sessions={allowLogin:async()=>true, create:async({accessHash,userId})=>sessionsMap.set(accessHash,userId),find:async hash=>sessionsMap.get(hash),remove:async hash=>sessionsMap.delete(hash)};
 const sessionService=createSessionService({sessions,users:createUserRepository(db)});
 const service=createAdminAccountService({transaction});
 const server=createApp({sessionService,adminAccountService:service}).listen(0,'127.0.0.1');await once(server,'listening');
 const base=`http://127.0.0.1:${server.address().port}/api/v1`;
 const body={username:'admin_api_child',email:'admin_api_child@example.com',password:'ExamplePass123!',confirm_password:'ExamplePass123!',full_name:'Test Internal',role:'ADMIN'};
 const request=(path,token,data)=>fetch(base+path,{method:data===undefined?'GET':'POST',headers:{...(token?{Authorization:`Bearer ${token}`} : {}),'Content-Type':'application/json'},...(data===undefined?{}:{body:JSON.stringify(data)})});
 let ownerId;
 try{
  const users=createUserRepository(db);
  ownerId=await users.insertAccount({username:'admin_api_owner',email:'admin_api_owner@example.com',passwordHash:await hashPassword(body.password),roleCode:'ADMIN'});
  await users.insertProfile({userId:ownerId,full_name:'Owner',phone:null});
  const noAuth=await request('/admin/accounts',null,body);assert.equal(noAuth.status,401);
  const wrong=await request('/auth/login',null,{identifier:'admin_api_owner',password:'WrongPassword!'});assert.equal(wrong.status,401);
  const login=await request('/auth/login',null,{identifier:' ADMIN_API_OWNER ',password:body.password});assert.equal(login.status,200);
  const token=(await login.json()).data.access_token;
  assert.ok(!sessionsMap.has(token));
  for(const role of ['ADMIN','MANAGER','OFFICE_STAFF','TECHNICIAN']){
    const username='admin_api_'+role.toLowerCase();
    const response=await request('/admin/accounts',token,{...body,username,email:username+'@example.com',role});
    assert.equal(response.status,201);const result=await response.json();assert.equal(result.data.account.role.role_code,role);
    assert.ok(!JSON.stringify(result).includes('password_hash'));
    const account=await users.findCredentialsByIdentifier(username);
    assert.equal(await verifyPassword(body.password,account.password_hash),true);
    const childLogin=await request('/auth/login',null,{identifier:username,password:body.password});assert.equal(childLogin.status,200);
    const childToken=(await childLogin.json()).data.access_token;
    if(role!=='ADMIN')assert.equal((await request('/admin/accounts',childToken,body)).status,403);
  }
  assert.equal((await request('/admin/accounts',token,{...body,role:'CUSTOMER'})).status,400);
  const customerId=await users.insertAccount({username:'admin_api_customer',email:'admin_api_customer@example.com',passwordHash:await hashPassword(body.password),roleCode:'CUSTOMER'});
  const customerSession=await sessionService.login({identifier:'admin_api_customer',password:body.password});
  assert.equal((await request('/admin/accounts',customerSession.access_token,body)).status,403);
  await db.query("UPDATE hrmss.user_account SET account_status='LOCKED' WHERE user_id=$1",[ownerId]);
  assert.equal((await request('/admin/accounts',token,body)).status,401);
  await db.query("UPDATE hrmss.user_account SET account_status='ACTIVE',role_id=(SELECT role_id FROM hrmss.role WHERE role_code='MANAGER') WHERE user_id=$1",[ownerId]);
  assert.equal((await request('/admin/accounts',token,body)).status,403);
  await db.query("UPDATE hrmss.user_account SET role_id=(SELECT role_id FROM hrmss.role WHERE role_code='ADMIN') WHERE user_id=$1",[ownerId]);
  const logout=await request('/auth/logout',token,{});assert.equal(logout.status,200);
  assert.equal((await request('/admin/accounts',token,body)).status,401);
  assert.equal(await users.findProfileByUserId(customerId),null);
 }finally{
  server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
  await db.query("DELETE FROM hrmss.user_account WHERE username LIKE 'admin!_api!_%' ESCAPE '!'");await db.end();
 }
});

test('Redis outage rejects login with 503, rate limit with 429',async()=>{
 const unavailable=createSessionService({sessions:{allowLogin:async()=>{throw Error('private URL');}},users:{}});
 await assert.rejects(unavailable.login({identifier:'x',password:'ExamplePass123!'}),{status:503,code:'SESSION_UNAVAILABLE'});
 const limited=createSessionService({sessions:{allowLogin:async()=>false},users:{}});
 await assert.rejects(limited.login({identifier:'x',password:'ExamplePass123!'}),{status:429});
});
