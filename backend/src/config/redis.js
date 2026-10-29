import { createClient } from 'redis';
import { env } from './env.js';

// Không xếp hàng lệnh khi Redis mất kết nối; yêu cầu xác thực phải báo lỗi thay vì chờ ngầm.
export const redis = createClient({
  url: env.REDIS_URL,
  disableOfflineQueue: true,
  socket: { connectTimeout: 3000, reconnectStrategy: false },
});

redis.on('error', error => console.error('Redis connection error:', error.code || error.name));
let connecting;

// Mở kết nối Redis khi cần. Các yêu cầu đồng thời dùng chung một Promise kết nối.
export async function connectRedis() {
  if (redis.isReady) return;
  connecting ??= redis.connect().finally(() => {
    connecting = undefined;
  });
  await connecting;
}

// Mở kết nối và gửi PING để kiểm tra Redis ngay khi khởi động.
export async function checkRedis() {
  await connectRedis();
  await redis.ping();
  console.log(`✅ [Redis] Connected to Redis server at ${env.REDIS_URL}`);
}
