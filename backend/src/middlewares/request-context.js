import { randomUUID } from 'node:crypto';
import { logger } from '../utils/logger.js';

// Tạo mã truy vết cho mỗi yêu cầu, ngăn lưu bộ nhớ đệm và ghi log HTTP khi hoàn tất.
export function requestContext(req, res, next) {
  const startTime = Date.now();
  res.locals.requestId = randomUUID();
  res.set('X-Request-Id', res.locals.requestId);
  res.set('Cache-Control', 'no-store');

  res.on('finish', () => {
    logger.http(req, res, Date.now() - startTime);
  });

  next();
}
