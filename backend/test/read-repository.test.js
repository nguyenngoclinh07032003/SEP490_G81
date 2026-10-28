import test from 'node:test';
import assert from 'node:assert/strict';
import createReadRepository from '../src/repositories/read.repository.js';
import { UserAccountModel, RolePermissionModel, UserLocationStateModel } from '../src/models/index.js';

test('generic account read hides credentials and binds values', async () => {
  let query;
  const db={async query(sql,values){query={sql,values};return {rows:[]};}};
  assert.equal(await createReadRepository(UserAccountModel, db).findById('123'),null);
  assert.ok(!query.sql.includes('password_hash'));
  assert.deepEqual(query.values,['123']);
  await assert.rejects(createReadRepository(UserAccountModel, db).findAll({where:{password_hash:'x'}}),TypeError);
  await assert.rejects(createReadRepository(UserAccountModel, db).findAll({limit:101}),RangeError);
  await createReadRepository(UserAccountModel, db).findAll({where:{username:"' OR 1=1 --"}});
  assert.ok(!query.sql.includes('OR 1=1'));
  assert.equal(query.values[0],"' OR 1=1 --");
});
test('composite key requires both columns and location reads hide coordinates', async () => {
  let sql;
  const db={async query(text){sql=text;return {rows:[]};}};
  await assert.rejects(createReadRepository(RolePermissionModel, db).findById({role_id:'1'}),TypeError);
  await createReadRepository(RolePermissionModel, db).findById({role_id:'1',permission_id:'2'});
  assert.ok(sql.includes('"role_id" = $1'));assert.ok(sql.includes('"permission_id" = $2'));
  await createReadRepository(UserLocationStateModel, db).findById('1');
  assert.ok(!sql.includes('latitude'));
});
