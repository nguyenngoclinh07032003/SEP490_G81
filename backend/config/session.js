import session from 'express-session';
import { RedisStore } from 'connect-redis';
import redisClient from './redis.js';

// Khởi tạo RedisStore cho Express-Session
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'hrmss:sess:',
});

const sessionMiddleware = session({
  store: redisStore,
  name: 'hrmss.sid',
  secret: process.env.SESSION_SECRET || 'HRMSS_SESSION_SECRET_KEY_FOR_SEP490_G81_CAPSTONE_2026',
  resave: false,
  saveUninitialized: false,
  rolling: true, // Tự động gia hạn thời gian sống của session cookie mỗi khi có request
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // Duy trì phiên 7 ngày
    sameSite: 'lax',
  },
});

export default sessionMiddleware;
