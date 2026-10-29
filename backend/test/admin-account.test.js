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

test('user retrieval, admin list/detail/roles and status lock with session revocation',async()=>{
 const mockAdmin={user_id:'1',username:'admin01',email:'admin01@hrmss.vn',account_status:'ACTIVE',created_at:'2026-01-01T00:00:00Z',role_id:'1',role_code:'ADMIN',role_name:'System Administrator',full_name:'Admin One',phone:'0901234567'};
 const mockStaff={user_id:'2',username:'staff01',email:'staff01@hrmss.vn',account_status:'ACTIVE',created_at:'2026-01-02T00:00:00Z',role_id:'3',role_code:'OFFICE_STAFF',role_name:'Office Staff',full_name:'Staff One',phone:null};
 const mockProfile={user_id:'1',full_name:'Admin One',phone:'0901234567',created_at:'2026-01-01T00:00:00Z',updated_at:'2026-01-01T00:00:00Z'};
 let revokedUserId=null;
 const mockRepo={
  findAccountById:async id=>id==='1'?mockAdmin:(id==='2'?mockStaff:null),
  findAccountByIdForShare:async id=>id==='1'?mockAdmin:(id==='2'?mockStaff:null),
  findProfileByUserId:async id=>id==='1'?mockProfile:null,
  listAccounts:async()=>({items:[mockAdmin,mockStaff],total:2}),
  countActiveAdmins:async()=>1,
  updateAccountStatus:async(id,status)=>{if(id==='2'){mockStaff.account_status=status;return mockStaff;}return null;}
 };
 const mockPermRepo={
  findPermissionsByUserId:async()=>[{permission_code:'user.create',permission_name:'Create User'}],
  listRoles:async()=>[{role_id:'1',role_code:'ADMIN',role_name:'System Administrator'},{role_id:'3',role_code:'OFFICE_STAFF',role_name:'Office Staff'}],
  hasPermission:async()=>true
 };
 const validToken='a'.repeat(64);
 const sessionService={
  authenticate:async token=>token===validToken?{user_id:'1',username:'admin01',email:'admin01@hrmss.vn',account_status:'ACTIVE',role:{role_id:'1',role_code:'ADMIN',role_name:'System Administrator'}}:(() => {throw Object.assign(Error('Unauthorized'),{status:401,code:'UNAUTHORIZED'});})(),
  getProfile:async userId=>userId==='1'?{user_id:'1',full_name:'Admin One',phone:'0901234567'}:null,
  logoutAll:async userId=>{revokedUserId=userId;}
 };
 const adminAccountService=createAdminAccountService({
  transaction:async work=>work({}),
  repository:()=>mockRepo,
  permissionRepository:()=>mockPermRepo
 });
 const server=createApp({sessionService,adminAccountService}).listen(0,'127.0.0.1');
 await once(server,'listening');
 const base=`http://127.0.0.1:${server.address().port}/api/v1`;
 const headers={Authorization:`Bearer ${validToken}`,'Content-Type':'application/json'};
 try{
  const meRes=await fetch(`${base}/auth/me`,{headers});
  assert.equal(meRes.status,200);
  const meBody=await meRes.json();
  assert.equal(meBody.data.account.username,'admin01');
  assert.equal(meBody.data.profile.full_name,'Admin One');

  const listRes=await fetch(`${base}/admin/accounts?page=1&limit=20`,{headers});
  assert.equal(listRes.status,200);
  const listBody=await listRes.json();
  assert.equal(listBody.data.items.length,2);
  assert.equal(listBody.data.pagination.total,2);

  const rolesRes=await fetch(`${base}/admin/accounts/roles`,{headers});
  assert.equal(rolesRes.status,200);
  const rolesBody=await rolesRes.json();
  assert.equal(rolesBody.data.roles.length,2);

  const detailRes=await fetch(`${base}/admin/accounts/1`,{headers});
  assert.equal(detailRes.status,200);
  const detailBody=await detailRes.json();
  assert.equal(detailBody.data.account.username,'admin01');
  assert.equal(detailBody.data.profile.full_name,'Admin One');

  const selfLockRes=await fetch(`${base}/admin/accounts/1/status`,{method:'PATCH',headers,body:JSON.stringify({status:'LOCKED'})});
  assert.equal(selfLockRes.status,409);

  const lockStaffRes=await fetch(`${base}/admin/accounts/2/status`,{method:'PATCH',headers,body:JSON.stringify({status:'LOCKED'})});
  assert.equal(lockStaffRes.status,200);
  const lockStaffBody=await lockStaffRes.json();
  assert.equal(lockStaffBody.data.account.account_status,'LOCKED');
  assert.equal(revokedUserId,'2');
 }finally{
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
 }
});
