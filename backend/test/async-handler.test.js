import test from 'node:test';
import assert from 'node:assert/strict';
import { asyncHandler } from '../src/utils/async-handler.js';

test('forwards synchronous throws and async rejections to Express error handler', async () => {
  for (const handler of [() => { throw new Error('sync'); }, async () => { throw new Error('async'); }]) {
    let forwarded;
    await asyncHandler(handler)({}, {}, error => { forwarded = error; });
    assert.ok(forwarded instanceof Error);
  }
});
