import { randomUUID } from 'node:crypto';
// Tạo mã truy vết cho mỗi yêu cầu và ngăn trình duyệt lưu bộ nhớ đệm phản hồi.
export function requestContext(_req,res,next) {
  res.locals.requestId=randomUUID();
  res.set('X-Request-Id',res.locals.requestId);
  res.set('Cache-Control','no-store');
  next();
}
