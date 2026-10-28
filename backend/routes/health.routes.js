import { Router } from 'express';
import pool from '../config/database.js';
import redisClient from '../config/redis.js';

const router = Router();

router.get('/health', async (_req, res) => {
  let dbStatus = 'DISCONNECTED';
  let redisStatus = 'DISCONNECTED';

  // Kiểm tra kết nối PostgreSQL
  try {
    const dbRes = await pool.query('SELECT NOW() AS current_time');
    if (dbRes?.rows?.length > 0) {
      dbStatus = 'CONNECTED';
    }
  } catch (err) {
    dbStatus = `ERROR: ${err.message}`;
  }

  // Kiểm tra kết nối Redis
  try {
    if (redisClient.isOpen) {
      const pong = await redisClient.ping();
      if (pong === 'PONG') {
        redisStatus = 'CONNECTED';
      }
    }
  } catch (err) {
    redisStatus = `ERROR: ${err.message}`;
  }

  const isHealthy = dbStatus === 'CONNECTED';

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'HEALTHY' : 'DEGRADED',
    service: 'HRMSS Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    infrastructure: {
      database: dbStatus,
      redis: redisStatus,
    },
  });
});

export default router;
