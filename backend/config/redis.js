import "dotenv/config";
import { createClient } from "redis";

// Ưu tiên sử dụng REDIS_URL nếu có (RedisLabs Cloud, Upstash...)
// Nếu không có REDIS_URL thì tự ghép từ REDIS_HOST/PORT/PASSWORD (Docker nội bộ)
const redisUrl =
  process.env.REDIS_URL ||
  (() => {
    const host = process.env.REDIS_HOST || "localhost";
    const port = Number(process.env.REDIS_PORT) || 6379;
    const pass = process.env.REDIS_PASSWORD
      ? `:${process.env.REDIS_PASSWORD}@`
      : "";
    return `redis://${pass}${host}:${port}`;
  })();

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("error", (err) => {
  // Ghi log cảnh báo để không làm sập server khi chưa bật Redis
  console.warn(
    "⚠️ [Redis] Chưa kết nối được hoặc Redis chưa bật:",
    err.message,
  );
});

redisClient.on("connect", () => {
  console.log("✅ [Redis] Đã kết nối thành công tới Redis server");
});

// Kết nối an toàn lúc khởi động
try {
  await redisClient.connect();
} catch (err) {
  console.warn(
    "⚠️ [Redis] Tạm thời chưa kết nối được lúc khởi động. Server vẫn chạy bình thường và sẽ tự kết nối lại khi bạn bật Redis.",
  );
}

export default redisClient;
