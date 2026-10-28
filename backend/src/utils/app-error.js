// Mang mã HTTP, mã lỗi nghiệp vụ và chi tiết lỗi để middleware trả phản hồi thống nhất.
export class AppError extends Error {
  constructor(status,code,message,details=[]) {
    super(message); this.status=status; this.code=code; this.details=details;
  }
}
