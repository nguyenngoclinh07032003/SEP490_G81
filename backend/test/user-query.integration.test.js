import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import createReadRepository from '../src/repositories/read.repository.js';
import { UserAccountModel, RolePermissionModel } from '../src/models/index.js';
import { createUserRepository } from '../src/repositories/user.repository.js';
import { createPermissionRepository } from '../src/repositories/permission.repository.js';
import { createUserQueryService } from '../src/services/user-query.service.js';

test('PostgreSQL user/profile/permission queries', {skip:!process.env.PG_TEST_DATABASE_URL}, async () => {
  const db=new pg.Client({connectionString:process.env.PG_TEST_DATABASE_URL});
  await db.connect();
  try {
    await db.query('BEGIN');
    const {rows:[customer]}=await db.query(`INSERT INTO hrmss.user_account(role_id,username,email,password_hash)
      SELECT role_id,'query_test','query_test@example.com','test_hash' FROM hrmss.role WHERE role_code='CUSTOMER' RETURNING user_id::text`);
    const id=customer.user_id;
    const generic=createReadRepository(UserAccountModel,db);
    const account=await generic.findById(id);
    assert.equal(account.username,'query_test');assert.ok(!('password_hash' in account));
    assert.equal((await generic.findAll({where:{username:'query_test'}})).length,1);
    const {rows:[grant]}=await db.query('SELECT role_id::text,permission_id::text FROM hrmss.role_permission LIMIT 1');
    assert.ok(await createReadRepository(RolePermissionModel,db).findById(grant));
    const service=createUserQueryService({users:createUserRepository(db),permissions:createPermissionRepository(db)});
    assert.equal(await service.findProfileByUserId(id),null);
    await db.query(`INSERT INTO hrmss.user_information(user_id,full_name,phone) VALUES($1,'Literal%_! Person','0123')`,[id]);
    assert.equal((await service.findProfileByUserId(id)).full_name,'Literal%_! Person');
    assert.equal((await service.findCredentialsForLogin(' QUERY_TEST@EXAMPLE.COM ')).password_hash,'test_hash');
    assert.ok(!('password_hash' in await service.findAccountById(id)));
    const list=await service.listAccounts({search:'%_!',role:'CUSTOMER',status:'ACTIVE'});
    assert.equal(list.pagination.total,1);assert.equal(list.items[0].user_id,id);
    const empty=await service.listAccounts({search:'%_!',page:2,limit:1});
    assert.equal(empty.pagination.total,1);assert.deepEqual(empty.items,[]);
    assert.equal((await service.listAccounts({search:"' OR 1=1 --"})).pagination.total,0);
    assert.equal(await service.hasPermission(id,'profile.read.own'),true);
    assert.equal(await service.hasPermission(id,'user.create'),false);
    assert.ok((await service.findPermissionsByUserId(id)).includes('profile.read.own'));
    await db.query(`UPDATE hrmss.user_account SET account_status='LOCKED' WHERE user_id=$1`,[id]);
    assert.equal(await service.hasPermission(id,'profile.read.own'),false);
    assert.deepEqual(await service.findPermissionsByUserId(id),[]);
    assert.equal((await service.listRoles()).length,5);
    await db.query(`DELETE FROM hrmss.role_permission WHERE role_id=(SELECT role_id FROM hrmss.role WHERE role_code='CUSTOMER')`);
    await db.query(`UPDATE hrmss.user_account SET account_status='ACTIVE' WHERE user_id=$1`,[id]);
    assert.deepEqual(await service.findPermissionsByUserId(id),[]);
    assert.equal(await service.findAccountById('9223372036854775807'),null);
  } finally {
    await db.query('ROLLBACK').catch(()=>{});await db.end();
  }
});
