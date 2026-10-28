import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import pg from 'pg';
import { env } from '../src/config/env.js';

// Tạo DB test mới mỗi lần chạy; tuyệt đối không nạp baseline vào DB development.
const root = fileURLToPath(new URL('../../', import.meta.url));
const name = 'hrmss_test_' + randomBytes(8).toString('hex');
const connection = { host: env.DB_HOST, port: env.DB_PORT, user: env.DB_USER,
  password: env.DB_PASSWORD, connectionTimeoutMillis: 3000 };
const startedAt = new Date().toISOString();
const report = { startedAt, database: name, status: 'failed', databaseRemoved: false };
let admin;
let created = false;
let child;
let interrupted = false;

// Chỉ dừng tiến trình test do script này tạo, rồi để finally dọn DB riêng.
function stopTests() {
  interrupted = true;
  if (child) child.kill();
}
process.on('SIGINT', stopTests);
process.on('SIGTERM', stopTests);

try {
  if (!['development', 'test'].includes(env.NODE_ENV) || env.DB_HOST !== '127.0.0.1'
    || !/^hrmss_test_[a-f0-9]{16}$/.test(name)) throw new Error('LOCAL_TEST_ONLY');
  admin = new pg.Client({ ...connection, database: 'postgres' });
  await admin.connect();
  await admin.query(`CREATE DATABASE "${name}"`);
  created = true;
  const database = new pg.Client({ ...connection, database: name });
  try {
    await database.connect();
    await database.query(await fs.readFile(new URL('../../database/hrmss_auth.sql', import.meta.url), 'utf8'));
  } finally { await database.end(); }
  if (interrupted) throw new Error('TEST_INTERRUPTED');

  // Mọi kết nối mặc định của tiến trình con cũng trỏ DB test, không chỉ PG_TEST_DATABASE_URL.
  const url = new URL('postgresql://localhost');
  url.hostname = env.DB_HOST; url.port = String(env.DB_PORT);
  url.username = env.DB_USER; url.password = env.DB_PASSWORD; url.pathname = '/' + name;
  let output = '';
  child = spawn(process.execPath, ['--test', '--test-reporter=tap'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)), windowsHide: true,
    env: { ...process.env, NODE_ENV: 'test', DB_NAME: name,
      PG_TEST_DATABASE_URL: url.href, REDIS_SESSION_TEST: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', chunk => { output += chunk.toString(); process.stdout.write(chunk); });
  child.stderr.on('data', chunk => process.stderr.write(chunk));
  const timer = setTimeout(stopTests, 180000);
  let code;
  try {
    code = await new Promise((resolve, reject) => {
      child.once('error', reject); child.once('close', resolve);
    });
  } finally { clearTimeout(timer); child = undefined; }
  for (const field of ['tests', 'pass', 'fail', 'skipped']) {
    const matches = [...output.matchAll(new RegExp('^# ' + field + ' (\\d+)$', 'gm'))];
    report[field] = matches.length ? Number(matches.at(-1)[1]) : null;
  }
  report.status = code === 0 && !interrupted && report.fail === 0 && report.skipped === 0
    ? 'passed' : 'failed';
  if (report.status !== 'passed') process.exitCode = 1;
} catch (error) {
  console.error('Không chạy được bộ test đầy đủ:', error.code || error.name);
  process.exitCode = 1;
} finally {
  // Tên DB được sinh và kiểm tra ở trên; chỉ xóa DB test do chính lần chạy này tạo.
  if (created) {
    try { await admin.query(`DROP DATABASE "${name}"`); report.databaseRemoved = true; }
    catch (error) {
      console.error('Chưa dọn được DB test:', name, error.code || error.name);
      report.status = 'failed'; process.exitCode = 1;
    }
  }
  if (admin) await admin.end();
  process.removeListener('SIGINT', stopTests); process.removeListener('SIGTERM', stopTests);
  report.finishedAt = new Date().toISOString();
  await fs.mkdir(root + '.local', { recursive: true });
  await fs.writeFile(root + '.local/test-results.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
}
