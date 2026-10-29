// Bọc handler để chuyển lỗi đồng bộ và Promise bị từ chối sang middleware lỗi của Express 4.
export function asyncHandler(handler) {
  return (req, res, next) =>
    Promise.resolve()
      .then(() => handler(req, res, next))
      .catch(next);
}
