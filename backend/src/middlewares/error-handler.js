import { AppError } from "../utils/app-error.js";
import { logger } from "../utils/logger.js";

// Trả lỗi 404 khi không có tuyến API khớp yêu cầu.
export function notFound(_req, _res, next) {
  next(new AppError(404, "NOT_FOUND", "Không tìm thấy API."));
}

// Chuẩn hóa lỗi theo hợp đồng API; che chi tiết lỗi nội bộ và thông tin nhạy cảm.
export function errorHandler(error, req, res, _next) {
  if (res.headersSent) return _next(error);
  let safe = error;
  if (error.type === "entity.parse.failed")
    safe = new AppError(400, "INVALID_JSON", "JSON không hợp lệ.");
  else if (error.type === "entity.too.large")
    safe = new AppError(413, "PAYLOAD_TOO_LARGE", "Dữ liệu vượt giới hạn.");
  else if (error.code === "23505")
    safe = new AppError(409, "RESOURCE_CONFLICT", "Dữ liệu đã tồn tại.");
  else if (!(error instanceof AppError)) {
    logger.error("Unhandled server error", {
      requestId: res.locals.requestId,
      method: req.method,
      path: req.originalUrl,
      type: error.name,
      code: error.code,
    });
    safe = new AppError(500, "INTERNAL_ERROR", "Có lỗi hệ thống.");
  }
  res.status(safe.status).json({
    success: false,
    code: safe.code,
    message: safe.message,
    data: null,
    errors: safe.details,
    meta: { requestId: res.locals.requestId },
  });
}
