---
name: capstone-analyze-design
description: >-
  Use this skill before writing code to analyze requirements, define Use Cases, design database schemas (ERD), architectures, and API contracts.
  Inspired by Workshop #02: "Before You Code: Analyze and Design Your Capstone Project" (Thầy Ngô Tuấn Khiêm).
---

# Before You Code: Analyze & Design Capstone Project

Cẩm nang phân tích nghiệp vụ, thiết kế kiến trúc hệ thống và chuẩn hóa cơ sở dữ liệu trước khi viết code.

## 1. Nguyên lý vàng: "Phân tích kỹ lưỡng trước khi gõ dòng code đầu tiên"
- Không bao giờ nhảy ngay vào viết code khi chưa nắm rõ luồng dữ liệu (Data Flow) và ranh giới hệ thống (System Boundary).
- Mọi tính năng đều phải xuất phát từ bài toán thực tế của người dùng và tài liệu đặc tả yêu cầu (SRS).

## 2. Quy trình phân tích & thiết kế chuẩn

### Bước 1: Đặc tả Use Case & Luồng nghiệp vụ
- Xác định rõ: **Actor** (Khách hàng, Kỹ thuật viên, Quản trị viên, Hệ thống).
- **Pre-conditions** (Điều kiện tiên quyết để thực hiện).
- **Main Flow** (Luồng thành công từng bước 1, 2, 3...).
- **Alternative / Exception Flow** (Các trường hợp lỗi: sai mật khẩu, thiết bị bận, mất kết nối mạng...).
- **Post-conditions** (Trạng thái dữ liệu thay đổi sau khi kết thúc).

### Bước 2: Thiết kế Cơ sở dữ liệu (Database Schema / ERD)
- Chuẩn hóa quan hệ tối thiểu đạt chuẩn 3NF (Third Normal Form) để tránh dư thừa và bất nhất dữ liệu.
- Thiết kế Primary Key, Foreign Key và các chỉ mục (Indexes) trên các cột thường xuyên tìm kiếm / filter / join.
- Quy ước đặt tên:
  - Tên bảng: chữ thường, số ít hoặc số nhiều nhất quán (VD: `user_account`, `service_order`).
  - Khóa chính: `<tên_bảng>_id` hoặc `id`.
  - Khóa ngoại: trỏ chính xác về bảng cha.
  - Luôn có cột audit: `created_at`, `updated_at`.

### Bước 3: Thiết kế API Contract (RESTful API Design)
- Chuẩn hóa URL theo danh từ tài nguyên số nhiều:
  - `GET /api/services` (Lấy danh sách dịch vụ)
  - `POST /api/services` (Thêm dịch vụ mới)
  - `GET /api/services/:id` (Chi tiết một dịch vụ)
  - `PUT /api/services/:id` (Cập nhật toàn bộ)
  - `PATCH /api/services/:id` (Cập nhật một phần)
  - `DELETE /api/services/:id` (Xóa/Vô hiệu hóa)
- Định dạng dữ liệu phản hồi thống nhất:
  ```json
  {
    "success": true,
    "message": "Mô tả kết quả thân thiện",
    "data": { ... }
  }
  ```
- Luôn xác định mã trạng thái HTTP chuẩn: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 409 (Conflict), 500 (Internal Error).

### Bước 4: Sơ đồ tương tác (Sequence Diagrams)
- Vẽ rõ ràng thứ tự tương tác giữa: **User/Browser ➔ Frontend App ➔ API Gateway/Backend ➔ Redis Cache ➔ PostgreSQL DB**.
