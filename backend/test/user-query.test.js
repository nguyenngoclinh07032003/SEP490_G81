import test from 'node:test';
import assert from 'node:assert/strict';
import { createUserQueryService } from '../src/services/user-query.service.js';
import { toPublicAccount } from '../src/mappers/user.mapper.js';

test('rejects invalid IDs and pagination before querying', async () => {
  const service = createUserQueryService({users:{findAccountById(){throw Error('must not query');}}});
  for (const id of ['-1', '9223372036854775808', '1 OR 1=1', 1]) {
    await assert.rejects(service.findAccountById(id), {code:'VALIDATION_ERROR'});
  }
  for (const query of [{limit:101},{page:0},{status:'BAD'},{sort:'password_hash'}]) {
    await assert.rejects(service.listAccounts(query), {code:'VALIDATION_ERROR'});
  }
});
test('login normalizes identifier, public mapper strips credentials and location', async () => {
  const service=createUserQueryService({users:{async findCredentialsByIdentifier(value){return value;}}});
  assert.equal(await service.findCredentialsForLogin(' USER@EXAMPLE.COM '),'user@example.com');
  const result=toPublicAccount({user_id:'9007199254740993',password_hash:'secret',latitude:10});
  assert.equal(result.user_id,'9007199254740993');
  assert.ok(!('password_hash' in result));assert.ok(!('latitude' in result));
});
