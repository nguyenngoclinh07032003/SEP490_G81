import net from 'node:net';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { env } from '../src/config/env.js';
import { pool } from '../src/config/database.js';
import { redis, connectRedis } from '../src/config/redis.js';
const run = promisify(execFile);
const root = fileURLToPath(new URL('../../', import.meta.url));
const local = path.join(root, '.local');
// Kiểm tra cổng localhost đang lắng nghe; luôn đóng socket sau khi có kết quả.
async function listening(port) {
  return new Promise(resolve => {
    const socket = net.connect({ host: '127.0.0.1', port });
    // Đóng socket thăm dò và trả kết quả kiểm tra cổng.
    const done = value => { socket.destroy(); resolve(value); };
    socket.once('connect', () => done(true)); socket.once('error', () => done(false));
    socket.setTimeout(1000, () => done(false));
  });
}
// Chỉ khởi động dịch vụ development chưa chạy, không tạo lại cluster hay reset dữ liệu.
try {
  if (!['development', 'test'].includes(env.NODE_ENV) || env.DB_HOST !== '127.0.0.1'
    || env.DB_PORT !== 5432) throw new Error('This launcher is only for the existing local portable Development setup.');
  if (!await listening(env.DB_PORT)) {
    await run('C:/Program Files/PostgreSQL/17/bin/pg_ctl.exe',
      ['-D', path.join(local, 'postgres-dev'), '-l', path.join(local, 'postgres-dev.log'), '-o', '-p 5432 -h 127.0.0.1', '-w', 'start'],
      { windowsHide: true, timeout: 30000 });
  }
  const url = new URL(env.REDIS_URL);
  if (!['localhost', '127.0.0.1'].includes(url.hostname) || url.port !== '6380') throw new Error('Expected local Redis on 6380.');
  if (!await listening(6380)) {
    const bin = path.join(local, 'redis-bin', 'Redis-8.10.3-Windows-x64-msys2', 'redis-server.exe');
    await fs.access(bin);
    const child = spawn(bin, ['redis.conf'], { cwd: path.join(local, 'redis-data'),
      detached: true, stdio: 'ignore', windowsHide: true });
    await new Promise((resolve, reject) => { child.once('spawn', resolve); child.once('error', reject); });
    child.unref();
    for (let i = 0; i < 20 && !await listening(6380); i++) await new Promise(resolve => setTimeout(resolve, 250));
  }
  // Kiểm tra truy vấn thật và PING Redis; cổng mở chưa đủ để kết luận dịch vụ sẵn sàng.
  await pool.query('SELECT user_id FROM hrmss.user_account LIMIT 0');
  await connectRedis(); await redis.ping();
  console.log('PostgreSQL/schema and Redis are ready. Start API with npm run dev.');
} catch (error) { console.error('Development startup failed:', error.code || error.message); process.exitCode = 1; }
finally { await pool.end(); if (redis.isOpen) await redis.quit(); }
