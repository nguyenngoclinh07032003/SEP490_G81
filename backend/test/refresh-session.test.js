import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { randomBytes, createHash } from 'node:crypto';
import { createClient } from 'redis';
import pg from 'pg';
import { createUserRepository } from '../src/repositories/user.repository.js';
import { env } from '../src/config/env.js';
import { createApp } from '../src/app.js';
import { createSessionService } from '../src/services/session.service.js';
import { createSessionRepository } from '../src/repositories/session.repository.js';
import { hashPassword } from '../src/utils/password.js';
const digest = token => createHash('sha256').update(token).digest('hex');
const unauthorized = promise => assert.rejects(promise, { status: 401 });

test('refresh rejects malformed tokens and sanitizes Redis failures', async () => {
  const service = createSessionService({ sessions: { findRefresh: async () => { throw Error('private'); } }, users: {} });
  await unauthorized(service.refresh('invalid'));
  await assert.rejects(service.refresh('a'.repeat(64)), { status: 503, code: 'SESSION_UNAVAILABLE' });
  const unavailable = createSessionService({ sessions: { find: async () => { throw Error('private blacklist connection'); } }, users: {} });
  await assert.rejects(unavailable.authenticate('a'.repeat(64)), { status: 503, code: 'SESSION_UNAVAILABLE' });
});

test('HTTP cookie contract, CSRF and strict input validation', async () => {
  const calls = [];
  const token = 'a'.repeat(64);
  const service = {
    login: async () => ({ access_token: token, expires_in: 900, token_type: 'Bearer', refreshToken: token, refreshExpiresIn: 604800 }),
    refresh: async value => { calls.push(value); return service.login(); },
    logoutRefresh: async value => calls.push(value),
  };
  const server = createApp({ sessionService: service }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api/v1/auth`;
  const post = (path, body, headers = {}) => fetch(base + path, { method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  try {
    const login = await post('/login', { identifier: 'user', password: 'Example123!' });
    const cookie = login.headers.get('set-cookie');
    assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Lax/i);
    assert.match(cookie, /Path=\/api\/v1\/auth/); assert.match(cookie, /Max-Age=604800/);
    const body = await login.json();
    assert.equal(body.data.refreshToken, undefined); assert.equal(body.data.refreshExpiresIn, undefined);
    const headers = { Origin: env.CORS_ORIGIN, Cookie: `hrmss_refresh=${token}` };
    assert.equal((await post('/refresh', {})).status, 403);
    assert.equal((await post('/refresh', {}, { ...headers, Origin: 'https://evil.test' })).status, 403);
    assert.equal((await post('/login', { identifier: 'user', password: 'Example123!' }, { Origin: 'https://evil.test' })).status, 403);
    assert.equal((await post('/refresh', { refresh_token: token }, headers)).status, 400);
    assert.equal((await post('/refresh?unexpected=1', {}, headers)).status, 400);
    assert.equal(calls.length, 0);
    const refresh = await post('/refresh', {}, headers);
    assert.equal(refresh.status, 200); assert.equal(calls[0], token);
    assert.equal((await refresh.json()).code, 'REFRESH_SUCCESS');
    const logout = await post('/logout', {}, headers);
    assert.equal(logout.status, 200); assert.match(logout.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('real Redis session lifecycle (isolated namespace, simulated users)', { skip: process.env.REDIS_SESSION_TEST !== '1' }, async t => {
  const client = createClient({ url: env.REDIS_URL, socket: { reconnectStrategy: false, connectTimeout: 3000 } });
  client.on('error', () => {});
  await client.connect();
  const namespace = `hrmss-test:${randomBytes(12).toString('hex')}:`;
  const repository = createSessionRepository({ client, connect: async () => {}, namespace });
  const user = { user_id: '123', username: 'session_test', role_code: 'CUSTOMER', account_status: 'ACTIVE',
    password_hash: await hashPassword('Example123!') };
  const service = createSessionService({ sessions: repository, users: {
    findCredentialsByIdentifier: async () => user,
    findAccountById: async () => ({ ...user }),
  } });
  const login = () => service.login({ identifier: user.username, password: 'Example123!' });
  const blocked = (type, value) => namespace + 'hrmss:auth:blacklist:' + type + ':' + value;
  try {
    await t.test('HTTP login/refresh/logout-all with real PostgreSQL and Redis', { skip: !process.env.PG_TEST_DATABASE_URL }, async () => {
      const db = new pg.Client({ connectionString: process.env.PG_TEST_DATABASE_URL });
      await db.connect();
      let server;
      try {
        await db.query('BEGIN');
        const users = createUserRepository(db);
        await users.insertAccount({ username: 'refresh_http_test', email: 'refresh_http_test@example.test',
          passwordHash: user.password_hash, roleCode: 'CUSTOMER' });
        const liveService = createSessionService({ sessions: repository, users });
        server = createApp({ sessionService: liveService }).listen(0, '127.0.0.1');
        await once(server, 'listening');
        const base = `http://127.0.0.1:${server.address().port}/api/v1/auth`;
        const post = (path, body, headers = {}) => fetch(base + path, { method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: env.CORS_ORIGIN, ...headers }, body: JSON.stringify(body) });
        const login = await post('/login', { identifier: 'refresh_http_test', password: 'Example123!' });
        assert.equal(login.status, 200);
        const cookie = login.headers.get('set-cookie').split(';')[0];
        const original = (await login.json()).data.access_token;
        const refresh = await post('/refresh', {}, { Cookie: cookie });
        assert.equal(refresh.status, 200);
        const currentCookie = refresh.headers.get('set-cookie').split(';')[0];
        const current = (await refresh.json()).data.access_token;
        assert.notEqual(current, original);
        assert.equal((await post('/logout-all', {}, { Authorization: `Bearer ${current}` })).status, 200);
        const rejected = await post('/refresh', {}, { Cookie: currentCookie });
        assert.equal(rejected.status, 401);
        assert.match(rejected.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/);
        await unauthorized(liveService.authenticate(original));
        await unauthorized(liveService.authenticate(current));
      } finally {
        if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
        await db.query('ROLLBACK'); await db.end();
      }
    });
    await t.test('rotation, absolute expiry, hash storage and replay revoke the entire family', async () => {
      const first = await login();
      assert.equal(first.expires_in, 900); assert.equal(first.refreshExpiresIn, 604800);
      const state = await repository.findRefresh(digest(first.refreshToken));
      const family = namespace + 'hrmss:auth:family:' + state.familyId;
      await client.pExpire(family, 60000);
      const second = await service.refresh(first.refreshToken);
      const refreshMarker = blocked('refresh', digest(first.refreshToken));
      assert.equal(await client.get(refreshMarker), 'rotated');
      assert.ok(await client.pTTL(refreshMarker) > 0);
      assert.ok(await client.pTTL(refreshMarker) <= 604800000);
      assert.notEqual(second.refreshToken, first.refreshToken);
      assert.notEqual(second.access_token, first.access_token);
      assert.ok(second.refreshExpiresIn <= 60); assert.ok(second.expires_in <= 60);
      assert.ok(await client.pTTL(family) <= 60000);
      assert.equal(await client.exists(namespace + 'hrmss:auth:' + first.access_token), 0);
      assert.equal(await client.exists(namespace + 'hrmss:auth:refresh:' + first.refreshToken), 0);
      await service.authenticate(second.access_token);
      await unauthorized(service.refresh(first.refreshToken));
      assert.equal(await client.get(blocked('family', state.familyId)), 'refresh_reuse');
      assert.ok(await client.pTTL(blocked('family', state.familyId)) <= 60000);
      await unauthorized(service.authenticate(first.access_token));
      await unauthorized(service.authenticate(second.access_token));
      assert.equal(await client.get(blocked('access', digest(second.access_token))), 'revoked');
      await unauthorized(service.refresh(second.refreshToken));
    });
    await t.test('concurrent refresh allows one rotation and replay revokes its result', async () => {
      const first = await login();
      const outcomes = await Promise.allSettled([service.refresh(first.refreshToken), service.refresh(first.refreshToken)]);
      assert.equal(outcomes.filter(value => value.status === 'fulfilled').length, 1);
      assert.equal(outcomes.filter(value => value.status === 'rejected').length, 1);
      const winner = outcomes.find(value => value.status === 'fulfilled').value;
      await unauthorized(service.authenticate(winner.access_token));
    });
    await t.test('logout affects one device, logout-all includes legacy sessions, login works afterwards', async () => {
      const first = await login(); const second = await login();
      await service.logout(first.access_token);
      assert.equal(await client.get(blocked('access', digest(first.access_token))), 'logout');
      assert.ok(await client.pTTL(blocked('access', digest(first.access_token))) <= 900000);
      await unauthorized(service.authenticate(first.access_token));
      await unauthorized(service.refresh(first.refreshToken));
      await service.authenticate(second.access_token);
      const legacy = randomBytes(32).toString('hex');
      await client.set(namespace + 'hrmss:auth:' + digest(legacy), user.user_id, { EX: 900 });
      await service.authenticate(legacy);
      await service.logoutAll(user.user_id);
      assert.equal(await client.get(blocked('access', digest(legacy))), 'logout_all');
      assert.equal(await client.get(blocked('access', digest(second.access_token))), 'logout_all');
      assert.equal(await client.get(blocked('refresh', digest(second.refreshToken))), 'logout_all');
      await unauthorized(service.authenticate(legacy));
      await unauthorized(service.authenticate(second.access_token));
      await unauthorized(service.refresh(second.refreshToken));
      const third = await login(); await service.authenticate(third.access_token);
      await service.logoutRefresh(third.refreshToken);
      assert.equal(await client.get(blocked('refresh', digest(third.refreshToken))), 'logout');
      await unauthorized(service.authenticate(third.access_token));
    });
    await t.test('expired access can refresh; locked accounts and expired families cannot', async () => {
      const first = await login();
      await client.del(namespace + 'hrmss:auth:' + digest(first.access_token));
      await unauthorized(service.authenticate(first.access_token));
      const second = await service.refresh(first.refreshToken);
      user.account_status = 'LOCKED';
      await unauthorized(service.refresh(second.refreshToken));
      assert.equal(await client.get(blocked('refresh', digest(second.refreshToken))), 'account_inactive');
      user.account_status = 'ACTIVE';
      await unauthorized(service.authenticate(second.access_token));
      const third = await login();
      const state = await repository.findRefresh(digest(third.refreshToken));
      await client.del(namespace + 'hrmss:auth:family:' + state.familyId);
      await unauthorized(service.refresh(third.refreshToken));
    });
    await t.test('live role change is reflected in authentication and refresh', async () => {
      const first = await login(); user.role_code = 'MANAGER';
      assert.equal((await service.authenticate(first.access_token)).role.role_code, 'MANAGER');
      assert.equal((await service.refresh(first.refreshToken)).account.role.role_code, 'MANAGER');
    });
    await t.test('missing generation fails closed and cannot resurrect an old family', async () => {
      const first = await login();
      await client.del(namespace + 'hrmss:auth:generation:' + user.user_id);
      await unauthorized(service.authenticate(first.access_token));
      await unauthorized(service.refresh(first.refreshToken));
      const second = await login();
      await service.authenticate(second.access_token);
      await unauthorized(service.authenticate(first.access_token));
      await unauthorized(service.refresh(first.refreshToken));
    });
    await t.test('blacklist expires with the token; missing/expired tokens do not create entries', async () => {
      const token = randomBytes(32).toString('hex');
      const hash = digest(token);
      const access = namespace + 'hrmss:auth:' + hash;
      await client.set(access, user.user_id, { PX: 200 });
      await service.logout(token);
      const marker = blocked('access', hash);
      assert.equal(await client.get(marker), 'logout');
      const ttl = await client.pTTL(marker);
      assert.ok(ttl > 0 && ttl <= 200);
      // Thu hồi lặp lại không được kéo dài thời hạn blacklist ban đầu.
      await service.logout(token);
      assert.ok(await client.pTTL(marker) <= ttl);
      await new Promise(resolve => setTimeout(resolve, 250));
      assert.equal(await client.exists(marker), 0);
      await service.logout(token);
      assert.equal(await client.exists(marker), 0);
      await unauthorized(service.authenticate(token));
      await unauthorized(service.refresh(token));
      assert.equal(await client.exists(blocked('refresh', hash)), 0);
    });
    await t.test('blacklist rejects even an otherwise live access token', async () => {
      const first = await login();
      await client.set(blocked('access', digest(first.access_token)), 'revoked', { EX: 900 });
      await unauthorized(service.authenticate(first.access_token));
      const second = await service.refresh(first.refreshToken);
      const state = await repository.findRefresh(digest(second.refreshToken));
      await client.set(blocked('family', state.familyId), 'revoked', { EX: 900 });
      await unauthorized(service.authenticate(second.access_token));
      await unauthorized(service.refresh(second.refreshToken));
    });
    await t.test('logout-all scan preserves logins issued after generation changes and other users', async () => {
      const first = await login();
      const other = { accessHash: randomBytes(32).toString('hex'), refreshHash: randomBytes(32).toString('hex'),
        familyId: randomBytes(32).toString('hex'), userId: '456', accessSeconds: 900, refreshSeconds: 604800 };
      await repository.create(other);
      const later = { ...other, userId: user.user_id, accessHash: randomBytes(32).toString('hex'),
        refreshHash: randomBytes(32).toString('hex'), familyId: randomBytes(32).toString('hex') };
      const concurrent = createSessionRepository({ namespace, connect: async () => {}, client: {
        eval: client.eval.bind(client),
        async *scanIterator(options) {
          await repository.create(later);
          yield* client.scanIterator(options);
        },
      } });
      await concurrent.revokeAll(user.user_id);
      await unauthorized(service.authenticate(first.access_token));
      assert.equal(await repository.find(later.accessHash), user.user_id);
      assert.equal(await repository.find(other.accessHash), '456');
      assert.equal(await client.exists(blocked('access', later.accessHash)), 0);
      assert.equal(await client.exists(blocked('refresh', later.refreshHash)), 0);
      assert.equal(await client.exists(blocked('access', other.accessHash)), 0);
    });
  } finally {
    for await (const key of client.scanIterator({ MATCH: namespace + '*', COUNT: 100 })) await client.del(key);
    await client.quit();
  }
});
