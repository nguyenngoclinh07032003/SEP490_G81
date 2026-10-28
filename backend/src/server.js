import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './config/database.js';
import { redis } from './config/redis.js';
// Khởi động API tại cổng được cấu hình trong môi trường.
const server=createApp().listen(env.PORT,()=>console.log(`HRMSS health: http://localhost:${env.PORT}/api/v1/health`));
server.on('error',error=>{console.error(error.code === 'EADDRINUSE' ? `Port ${env.PORT} is already in use. Stop the previous API process before restarting.` : `Server error: ${error.code || error.name}`);process.exitCode=1;});
let stopping=false;
// Ngừng nhận yêu cầu mới rồi đóng kết nối PostgreSQL/Redis; tối đa chờ 10 giây.
async function shutdown() {
  if(stopping)return;stopping=true;
  const timer=setTimeout(()=>process.exit(1),10000);timer.unref();
  server.close(async()=>{
    await Promise.allSettled([pool.end(),redis.isOpen?redis.quit():Promise.resolve()]);
    clearTimeout(timer);
  });
}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
