import { AppError } from '../utils/app-error.js';
import { success } from '../utils/response.js';
import { asyncHandler } from '../utils/async-handler.js';

// Trả trạng thái hoạt động và mức sẵn sàng của các dịch vụ phụ thuộc.
export function createHealthController(service) {
  return {
    // Xác nhận tiến trình API còn hoạt động.
    live: (_req, res) => success(res, {
      code: 'SERVICE_ALIVE',
      data: service.live(),
    }),
    // Trả 503 nếu PostgreSQL hoặc Redis chưa sẵn sàng.
    ready: asyncHandler(async (_req, res) => {
      const data = await service.ready();
      if (data.status !== 'ready') {
        const details = Object.entries(data.dependencies)
          .map(([field, state]) => ({ field, message: state }));
        throw new AppError(503, 'SERVICE_NOT_READY', 'Kết nối phụ thuộc chưa sẵn sàng.', details);
      }
      return success(res, {
        code: 'SERVICE_READY',
        message: 'Sẵn sàng.',
        data,
      });
    }),
  };
}
