import { env } from '../config/env.js';

// Định dạng thời gian chuẩn ISO dễ đọc cho từng dòng nhật ký (log).
function timestamp() {
  return new Date().toISOString();
}

// Ghi nhật ký chuẩn hóa: định dạng JSON ở production, định dạng dễ đọc ở development.
function writeLog(level, message, meta = {}) {
  if (env.NODE_ENV === 'test' && level !== 'ERROR') return;

  const time = timestamp();
  const hasMeta = Object.keys(meta).length > 0;

  if (env.NODE_ENV === 'production') {
    const payload = JSON.stringify({ timestamp: time, level, message, ...meta });
    if (level === 'ERROR') console.error(payload);
    else if (level === 'WARN') console.warn(payload);
    else console.log(payload);
    return;
  }

  const metaText = hasMeta ? ` ${JSON.stringify(meta)}` : '';
  const line = `[${time}] [${level}] ${message}${metaText}`;
  if (level === 'ERROR') console.error(line);
  else if (level === 'WARN') console.warn(line);
  else console.log(line);
}

export const logger = {
  info(message, meta) {
    writeLog('INFO', message, meta);
  },
  warn(message, meta) {
    writeLog('WARN', message, meta);
  },
  error(message, meta) {
    writeLog('ERROR', message, meta);
  },
  // Ghi nhật ký cho mỗi HTTP request khi hoàn tất phản hồi.
  http(req, res, durationMs) {
    const status = res.statusCode;
    const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';
    writeLog(level, `${req.method} ${req.originalUrl} ${status} - ${durationMs}ms`, {
      requestId: res.locals.requestId,
    });
  },
};

