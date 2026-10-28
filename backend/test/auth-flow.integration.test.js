import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { randomBytes, createHash } from 'node:crypto';
import pg from 'pg';
import { createClient } from 'redis';
import { env } from '../src/config/env.js';
import { pool } from '../src/config/database.js';
import { redis } from '../src/config/redis.js';
import { createApp } from '../src/app.js';
import { createAuthService } from '../src/services/auth.service.js';
import { createAdminAccountService } from '../src/services/admin-account.service.js';
import { createSessionService } from '../src/services/session.service.js';
import { createSessionRepository } from '../src/repositories/session.repository.js';
import { createUserRepository } from '../src/repositories/user.repository.js';
import { hashPassword } from '../src/utils/password.js';

const digest = value => createHash('sha256').update(value).digest('hex');
const enabled = Boolean(process.env.PG_TEST_DATABASE_URL) && process.env.REDIS_SESSION_TEST === '1';

test('HTTP tổng luồng với đủ role, PostgreSQL và Redis thật', { skip: !enabled }, async t => {
  const db = new pg.Client({ connectionString: process.env.PG_TEST_DATABASE_URL });
  const client = createClient({ url: env.REDIS_URL, socket: { reconnectStrategy: false, connectTimeout: 3000 } });
  client.on('error', () => {});
  const namespace = `hrmss-flow-test:${randomBytes(10).toString('hex')}:`;
  let server;
  await db.connect();
  try {
    await client.connect();
    await db.query('BEGIN');
    // Mỗi nghiệp vụ dùng savepoint; cuối bài ROLLBACK toàn bộ fixture và thay đổi quyền.
    const transaction = async work => {
      await db.query('SAVEPOINT auth_action');
      try {
        const result = await work(db);
        await db.query('RELEASE SAVEPOINT auth_action');
        return result;
      } catch (error) {
        await db.query('ROLLBACK TO SAVEPOINT auth_action');
        await db.query('RELEASE SAVEPOINT auth_action');
        throw error;
      }
    };
    const users = createUserRepository(db);
    const sessions = createSessionRepository({ client, connect: async () => {}, namespace });
    const sessionService = createSessionService({ sessions, users });
    const password = 'Test-' + randomBytes(12).toString('hex');
    const passwordHash = await hashPassword(password);
    const prefix = 'flow_' + randomBytes(5).toString('hex');
    const accounts = {};
    for (const role of ['ADMIN', 'MANAGER', 'OFFICE_STAFF', 'TECHNICIAN', 'CUSTOMER']) {
      const username = prefix + '_' + role.toLowerCase();
      const id = await users.insertAccount({ username, email: username + '@example.test', passwordHash, roleCode: role });
      await users.insertProfile({ userId: id, full_name: 'Fixture ' + role, phone: null });
      accounts[role] = { id, username, email: username + '@example.test' };
    }
    server = createApp({ authService: createAuthService({ transaction }), sessionService,
      adminAccountService: createAdminAccountService({ transaction }) }).listen(0, '127.0.0.1');
    await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}/api/v1`;
    // Kiểm tra envelope cho mọi phản hồi, không chỉ mã HTTP.
    async function request(path, { body, token, cookie, origin = env.CORS_ORIGIN } = {}) {
      const response = await fetch(base + path, { method: body === undefined ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}),
          ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(cookie ? { Cookie: cookie } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      const data = await response.json();
      assert.equal(data.success, response.ok);
      assert.equal(typeof data.code, 'string'); assert.equal(typeof data.message, 'string');
      assert.equal(data.meta.requestId, response.headers.get('x-request-id'));
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.ok(!JSON.stringify(data).includes('password_hash'));
      assert.ok(!JSON.stringify(data).includes(password));
      assert.equal(data.data?.refreshToken, undefined);
      if (!response.ok) { assert.equal(data.data, null); assert.ok(Array.isArray(data.errors)); }
      return { status: response.status, data, headers: response.headers,
        cookie: response.headers.get('set-cookie')?.split(';')[0] };
    }
    // Đăng nhập fixture và giữ riêng token/cookie của từng nhóm phiên.
    async function login(role) {
      const result = await request('/auth/login', { body: { identifier: accounts[role].username, password } });
      assert.equal(result.status, 200);
      return { ...result, token: result.data.data.access_token };
    }
    const validBody = { username: prefix + '_child', email: prefix + '_child@example.test', password,
      confirm_password: password, full_name: 'Fixture child', role: 'ADMIN' };

    await t.test('health/readiness kết nối thật và báo lỗi đúng envelope', async () => {
      assert.equal((await request('/health')).status, 200);
      const ready = await request('/health/ready');
      assert.equal(ready.status, 200); assert.deepEqual(ready.data.data.dependencies, { postgres: 'up', redis: 'up' });
      assert.equal((await request('/not-an-api')).status, 404);
      assert.equal((await request('/auth/me')).status, 401);
      assert.equal((await request('/admin/accounts', { body: validBody })).status, 401);
    });
    await t.test('đủ 5 role đăng nhập và /me chỉ trả đúng chủ token', async () => {
      for (const [role, account] of Object.entries(accounts)) {
        account.session = await login(role);
        const me = await request('/auth/me', { token: account.session.token });
        assert.equal(me.status, 200); assert.equal(me.data.data.account.user_id, account.id);
        assert.equal(me.data.data.account.role.role_code, role);
        assert.equal((await request('/auth/me?user_id=' + accounts.ADMIN.id, { token: account.session.token })).status, 400);
        assert.equal((await request('/auth/me/' + accounts.ADMIN.id, { token: account.session.token })).status, 404);
      }
    });
    await t.test('email đăng nhập được chuẩn hóa; mật khẩu sai/tài khoản lạ trả cùng lỗi', async () => {
      const email = await request('/auth/login', { body: { identifier: ' ' + accounts.CUSTOMER.email.toUpperCase() + ' ', password } });
      assert.equal(email.status, 200);
      await sessionService.logout(email.data.data.access_token);
      const wrong = await request('/auth/login', { body: { identifier: accounts.ADMIN.username, password: 'WrongPassword!' } });
      const unknown = await request('/auth/login', { body: { identifier: prefix + '_missing', password } });
      assert.equal(wrong.status, 401); assert.equal(unknown.status, 401);
      assert.equal(wrong.data.code, unknown.data.code); assert.equal(wrong.data.message, unknown.data.message);
    });
    await t.test('ADMIN tạo đủ 4 role nội bộ; signup luôn CUSTOMER, trùng dữ liệu trả 409', async () => {
      for (const role of ['ADMIN', 'MANAGER', 'OFFICE_STAFF', 'TECHNICIAN']) {
        const body = { ...validBody, username: prefix + '_new_' + role.toLowerCase(),
          email: prefix + '_new_' + role.toLowerCase() + '@example.test', role };
        const result = await request('/admin/accounts', { token: accounts.ADMIN.session.token, body });
        assert.equal(result.status, 201); assert.equal(result.data.data.account.role.role_code, role);
      }
      const { role, ...body } = validBody;
      const signup = await request('/auth/signup', { body });
      assert.equal(signup.status, 201); assert.equal(signup.data.data.account.role.role_code, 'CUSTOMER');
      assert.equal((await request('/auth/signup', { body })).status, 409);
      for (const extra of [{ role: 'ADMIN' }, { account_status: 'ACTIVE' }, { unknown: 1 }]) {
        assert.equal((await request('/auth/signup', { body: { ...body, ...extra } })).status, 400);
      }
      assert.equal((await request('/admin/accounts', { token: accounts.ADMIN.session.token,
        body: { ...validBody, role: 'CUSTOMER' } })).status, 400);
    });
    await t.test('4 role khác không tạo được nội bộ, kể cả MANAGER được gán user.create', async () => {
      await db.query(`INSERT INTO hrmss.role_permission(role_id,permission_id)
        SELECT r.role_id,p.permission_id FROM hrmss.role r CROSS JOIN hrmss.permission p
        WHERE r.role_code='MANAGER' AND p.permission_code='user.create' ON CONFLICT DO NOTHING`);
      const { rows: [grant] } = await db.query(`SELECT EXISTS(SELECT 1 FROM hrmss.role_permission rp
        JOIN hrmss.role r USING(role_id) JOIN hrmss.permission p USING(permission_id)
        WHERE r.role_code='MANAGER' AND p.permission_code='user.create') AS present`);
      assert.equal(grant.present, true);
      for (const role of ['MANAGER', 'OFFICE_STAFF', 'TECHNICIAN', 'CUSTOMER']) {
        assert.equal((await request('/admin/accounts', { token: accounts[role].session.token, body: validBody })).status, 403);
      }
    });
    await t.test('ADMIN thiếu user.create bị từ chối; quyền khôi phục có hiệu lực ngay', async () => {
      const { rows: [grant] } = await db.query(`DELETE FROM hrmss.role_permission rp USING hrmss.role r, hrmss.permission p
        WHERE rp.role_id=r.role_id AND rp.permission_id=p.permission_id AND r.role_code='ADMIN'
        AND p.permission_code='user.create' RETURNING rp.role_id::text,rp.permission_id::text`);
      assert.ok(grant);
      assert.equal((await request('/admin/accounts', { token: accounts.ADMIN.session.token, body: validBody })).status, 403);
      await db.query('INSERT INTO hrmss.role_permission(role_id,permission_id) VALUES($1,$2)', [grant.role_id, grant.permission_id]);
      assert.equal((await request('/admin/accounts', { token: accounts.ADMIN.session.token, body: validBody })).status, 409);
    });
    await t.test('role mới lấy từ DB ngay trên token cũ', async () => {
      await db.query(`UPDATE hrmss.user_account SET role_id=(SELECT role_id FROM hrmss.role WHERE role_code='TECHNICIAN') WHERE user_id=$1`, [accounts.MANAGER.id]);
      const me = await request('/auth/me', { token: accounts.MANAGER.session.token });
      assert.equal(me.data.data.account.role.role_code, 'TECHNICIAN');
      await db.query(`UPDATE hrmss.user_account SET role_id=(SELECT role_id FROM hrmss.role WHERE role_code='MANAGER') WHERE user_id=$1`, [accounts.MANAGER.id]);
    });
    await t.test('tài khoản LOCKED bị chặn login, /me và refresh', async () => {
      await db.query("UPDATE hrmss.user_account SET account_status='LOCKED' WHERE user_id=$1", [accounts.OFFICE_STAFF.id]);
      assert.equal((await request('/auth/login', { body: { identifier: accounts.OFFICE_STAFF.username, password } })).status, 401);
      assert.equal((await request('/auth/me', { token: accounts.OFFICE_STAFF.session.token })).status, 401);
      assert.equal((await request('/auth/refresh', { body: {}, cookie: accounts.OFFICE_STAFF.session.cookie })).status, 401);
    });
    await t.test('access thực sự hết TTL vẫn refresh được, logout bằng cookie không cần Bearer', async () => {
      const session = await login('CUSTOMER');
      const access = namespace + 'hrmss:auth:' + digest(session.token);
      await client.pExpire(access, 1); await new Promise(resolve => setTimeout(resolve, 25));
      assert.equal(await client.exists(access), 0);
      assert.equal((await request('/auth/me', { token: session.token })).status, 401);
      const refreshed = await request('/auth/refresh', { body: {}, cookie: session.cookie });
      assert.equal(refreshed.status, 200);
      assert.equal((await request('/auth/logout', { body: {}, cookie: refreshed.cookie })).status, 200);
      assert.equal((await request('/auth/me', { token: refreshed.data.data.access_token })).status, 401);
    });
    await t.test('refresh/nhóm thực sự hết TTL bị từ chối, không tạo BL cho token đã hết hạn', async () => {
      const session = await login('CUSTOMER');
      const refreshHash = digest(session.cookie.split('=')[1]);
      const state = await sessions.findRefresh(refreshHash);
      await client.pExpire(namespace + 'hrmss:auth:refresh:' + refreshHash, 1);
      await client.pExpire(namespace + 'hrmss:auth:family:' + state.familyId, 1);
      await new Promise(resolve => setTimeout(resolve, 25));
      assert.equal((await request('/auth/refresh', { body: {}, cookie: session.cookie })).status, 401);
      assert.equal(await client.exists(namespace + 'hrmss:auth:blacklist:refresh:' + refreshHash), 0);
    });
    await t.test('dùng lại refresh cũ qua HTTP thu hồi cả access/refresh mới', async () => {
      const session = await login('CUSTOMER');
      const refresh = await request('/auth/refresh', { body: {}, cookie: session.cookie });
      assert.equal(refresh.status, 200); assert.notEqual(refresh.cookie, session.cookie);
      assert.equal((await request('/auth/refresh', { body: {}, cookie: session.cookie })).status, 401);
      assert.equal((await request('/auth/me', { token: refresh.data.data.access_token })).status, 401);
      assert.equal((await request('/auth/refresh', { body: {}, cookie: refresh.cookie })).status, 401);
    });
    await t.test('logout chỉ một nhóm, logout-all chặn các nhóm còn lại nhưng giữ user khác', async () => {
      const first = await login('ADMIN'); const second = await login('ADMIN');
      assert.equal((await request('/auth/logout', { body: {}, token: first.token })).status, 200);
      assert.equal((await request('/auth/me', { token: first.token })).status, 401);
      assert.equal((await request('/auth/me', { token: second.token })).status, 200);
      assert.equal((await request('/auth/logout-all', { body: {}, token: second.token })).status, 200);
      for (const token of [second.token, accounts.ADMIN.session.token]) {
        assert.equal((await request('/auth/me', { token })).status, 401);
      }
      assert.equal((await request('/auth/me', { token: accounts.CUSTOMER.session.token })).status, 200);
      const next = await login('ADMIN');
      assert.equal((await request('/auth/me', { token: next.token })).status, 200);
    });
    await t.test('CSRF: refresh thiếu Origin hoặc Origin lạ trả 403; thiếu cookie trả 401', async () => {
      assert.equal((await request('/auth/refresh', { body: {}, origin: '' })).status, 403);
      assert.equal((await request('/auth/refresh', { body: {}, origin: 'https://evil.test' })).status, 403);
      assert.equal((await request('/auth/refresh', { body: {} })).status, 401);
      assert.equal((await request('/auth/refresh', { body: { refresh_token: 'not-accepted' } })).status, 400);
    });
    await t.test('rate limit Redis thật: tối đa 20/IP/15 phút và HTTP trả 429', async () => {
      const fixture = digest('separate-rate-fixture');
      for (let i = 0; i < 20; i++) assert.equal(await sessions.allowLogin(fixture), true);
      assert.equal(await sessions.allowLogin(fixture), false);
      assert.ok(await client.ttl(namespace + 'hrmss:auth:attempt:' + fixture) <= 900);
      await client.set(namespace + 'hrmss:auth:attempt:' + digest('127.0.0.1'), '20', { EX: 900 });
      const limited = await request('/auth/login', { body: { identifier: accounts.ADMIN.username, password } });
      assert.equal(limited.status, 429); assert.equal(limited.data.code, 'LOGIN_RATE_LIMIT');
    });
    await t.test('kết nối Redis phiên bị đóng: HTTP trả 503 thay vì cho qua xác thực', async () => {
      await client.quit();
      const result = await request('/auth/me', { token: accounts.CUSTOMER.session.token });
      assert.equal(result.status, 503); assert.equal(result.data.code, 'SESSION_UNAVAILABLE');
    });
  } finally {
    if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
    // Kết nối lại chỉ để dọn đúng vùng tên của bài test, không dùng FLUSHDB/FLUSHALL.
    if (!client.isOpen) await client.connect();
    for await (const key of client.scanIterator({ MATCH: namespace + '*', COUNT: 100 })) await client.del(key);
    await client.quit();
    await db.query('ROLLBACK'); await db.end();
    await pool.end(); if (redis.isOpen) await redis.quit();
  }
});
