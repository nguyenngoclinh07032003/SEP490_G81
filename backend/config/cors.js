import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

// Nạp thêm CORS_ORIGIN từ file .env nếu có
const customOrigin = process.env.CORS_ORIGIN;
if (customOrigin && !allowedOrigins.includes(customOrigin)) {
  allowedOrigins.push(customOrigin);
}

const corsOptions = {
  origin: (origin, callback) => {
    // Cho phép requests không có origin (Postman, Mobile App) hoặc các cổng localhost phát triển
    if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

export default cors(corsOptions);
