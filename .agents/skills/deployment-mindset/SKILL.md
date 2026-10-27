---
name: deployment-mindset
description: >-
  Use this skill to guide production deployment, containerization (Docker), environment configuration, infrastructure resilience, and cloud operations.
  Inspired by Workshop #04: "Deployment Mindset - From Code to Production" (Thầy Phạm Quang Khang).
---

# Deployment Mindset - From Code to Production

Cẩm nang tư duy triển khai hệ thống: đưa phần mềm từ localhost lên môi trường máy chủ thực tế (Cloud / VPS) an toàn, ổn định và tối ưu tài nguyên.

## 1. Nguyên lý "From Code to Production"
- "It works on my machine" không có nghĩa là phần mềm đã hoàn thành. Một dự án đạt chuẩn phải sẵn sàng vận hành liên tục 24/7 trên môi trường thực tế.
- Tách biệt tuyệt đối giữa **Mã nguồn (Code)** và **Cấu hình (Configuration)** theo nguyên lý The Twelve-Factor App.

## 2. Quy chuẩn cấu hình & Biến môi trường
- **Không bao giờ hardcode**: Tuyệt đối không viết cứng IP `localhost`, port, database credentials, secret key trong file code.
- **Biến môi trường (.env)**:
  - Backend: Truy cập qua `process.env.<VAR_NAME>`.
  - Frontend: Truy cập qua `import.meta.env.VITE_<VAR_NAME>`.
  - File `.env` chứa bí mật thật **không bao giờ được commit lên Git**. Luôn lưu `.env.example` làm tài liệu mẫu.
- **URL linh hoạt**:
  - Hỗ trợ cả URL đầy đủ (ví dụ: `REDIS_URL` trên Upstash/Cloud) lẫn các thông số rời (`REDIS_HOST`, `REDIS_PORT`) khi chạy Docker nội bộ.

## 3. Khả năng chịu lỗi và suy biến nhẹ (Fault Tolerance & Graceful Degradation)
- Khi một dịch vụ ngoại vi (Redis, Email Service, SMS Gateway) gặp sự cố:
  - Bắt lỗi bằng `try/catch` có ghi nhận log cảnh báo.
  - Áp dụng cơ chế **Fallback**: Cho phép hệ thống tiếp tục phục vụ các luồng nghiệp vụ cơ bản thay vì làm sập (crash) toàn bộ ứng dụng.
- Cơ sở dữ liệu: Luôn sử dụng Connection Pooling để kiểm soát số lượng kết nối đồng thời và tự động kết nối lại (Reconnection logic).

## 4. Đóng gói & Vận hành (Docker & Reverse Proxy)
- **Containerization**: Viết file `Dockerfile` và `docker-compose.yml` chuẩn hóa, đảm bảo mọi thành viên trong nhóm và máy chủ VPS chạy trên cùng một môi trường runtime giống hệt nhau.
- **Production Build**:
  - Frontend: Chạy `npm run build` để nén mã nguồn thành static files tĩnh trong thư mục `dist/` (loại bỏ hot-reload dev tools).
  - Web Server / Reverse Proxy: Dùng Nginx làm cổng đón khách, phục vụ file tĩnh và chuyển tiếp API (`/api/`) về Backend Node.js.
  - Tiến trình Backend: Quản lý bằng PM2 hoặc Docker restart policy (`restart: always`) để tự khởi động lại khi gặp sự cố ngoài ý muốn.
- **HTTPS & Bảo mật**: Luôn kích hoạt chứng chỉ SSL/TLS (Let's Encrypt / Cloudflare) cho toàn bộ domain trên môi trường Production.
