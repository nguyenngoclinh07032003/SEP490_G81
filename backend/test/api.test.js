import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';

// Khởi chạy API ở cổng ngẫu nhiên để test và luôn đóng server sau khi kết thúc.
async function withApi(run) {
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await run(base);
  } finally {
    server.closeAllConnections();
    await new Promise(r => server.close(r));
  }
}

test('root connection message, request ID and no-store header', () =>
  withApi(async base => {
    const r = await fetch(base + '/api/v1');
    const b = await r.json();
    assert.equal(r.status, 200);
    assert.equal(b.message, 'Đã kết nối đến server');
    assert.ok(r.headers.get('x-request-id'));
    assert.equal(r.headers.get('cache-control'), 'no-store');
  }));

test('malformed JSON and missing endpoint use same error contract', () =>
  withApi(async base => {
    const invalid = await fetch(base + '/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{',
    });
    assert.equal(invalid.status, 400);
    assert.equal((await invalid.json()).code, 'INVALID_JSON');

    const missing = await fetch(base + '/api/v1/auth/login');
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).code, 'NOT_FOUND');
  }));

test('oversized body returns 413', () =>
  withApi(async base => {
    const r = await fetch(base + '/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ x: 'x'.repeat(40000) }),
    });
    assert.equal(r.status, 413);
    assert.equal((await r.json()).code, 'PAYLOAD_TOO_LARGE');
  }));
