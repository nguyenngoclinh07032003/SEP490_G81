---
name: vibe-coding-software-quality
description: >-
  Use this skill to ensure code quality, prevent regressions, run builds, write tests, refactor, and maintain high engineering standards when pair-programming with AI.
  Inspired by Workshop #05: "Ship Your Capstone with Confidence - Improving Software Quality in the Vibe-Coding Era" (Cô Doãn Thị Xuân).
---

# Ship Your Capstone with Confidence: Software Quality in the Vibe-Coding Era

Cẩm nang kiểm soát chất lượng phần mềm, ngăn ngừa lỗi tiềm ẩn và tự tin xuất xưởng sản phẩm Capstone trong kỷ nguyên lập trình cùng AI (Vibe-Coding).

## 1. Bản chất của "Vibe-Coding" & Nguy cơ tiềm ẩn
- **Vibe-Coding**: Lập trình tốc độ cao nhờ AI sinh code thông qua các đoạn prompt tự nhiên.
- **Rủi ro lớn nhất**:
  - Code sinh ra "nhìn có vẻ chạy được" nhưng thiếu kiểm tra dữ liệu biên (Edge cases).
  - Tồn tại mã chết (Dead code), thư viện thừa hoặc các lỗ hổng bảo mật tiềm ẩn (SQL Injection, XSS, thiếu xác thực quyền).
  - Lập trình viên phụ thuộc vào AI mà không đọc kỹ code, dẫn đến mất kiểm soát kiến trúc khi dự án phình to.

## 2. Tiêu chuẩn vàng để "Ship with Confidence"

### Tiêu chuẩn 1: Kiểm thử & Xác thực tự động (Automated Verification)
- Trước khi tuyên bố hoàn thành bất kỳ tính năng nào:
  1. Chạy lệnh Build (`npm run build`) để kiểm tra cú pháp, lỗi import, lỗi types và kích thước bundle.
  2. Viết kiểm thử cho các hàm xử lý logic quan trọng: tính toán doanh thu, mã hóa mật khẩu, kiểm tra token, kiểm tra phân quyền RBAC.
  3. Kiểm tra các ca biên (Boundary values): Chuỗi rỗng, số âm, email sai định dạng, tài khoản chưa được kích hoạt, giá trị `null` / `undefined`.

### Tiêu chuẩn 2: Kiến trúc Code sạch & Tái sử dụng (DRY & Modularity)
- Tuyệt đối không sao chép - dán (copy-paste) các đoạn logic lặp lại.
- Tách biệt rõ ràng các tầng:
  - **Component / UI**: Chỉ lo giao diện và tương tác người dùng.
  - **Services / API Client**: Độc quyền phụ trách giao tiếp mạng và chuẩn hóa dữ liệu.
  - **Controllers / Middlewares**: Kiểm tra tính hợp lệ của request và ủy quyền.
  - **Models / Data Access**: Tương tác trực tiếp với cơ sở dữ liệu.

### Tiêu chuẩn 3: Quy trình Review Code nghiêm ngặt
- Khi AI đề xuất sửa đổi:
  - Đọc kỹ từng dòng code thay đổi (Diff).
  - Kiểm tra xem code mới có làm gãy (breaking change) các tính năng cũ đang hoạt động không (Regression Testing).
  - Giữ lại các chú thích (comments) quan trọng và tài liệu hướng dẫn nội bộ.

### Tiêu chuẩn 4: Quản lý Git có kỷ luật
- Commit nhỏ, tập trung (Atomic commits) theo chuẩn Conventional Commits:
  - `feat(...)`: Thêm tính năng mới.
  - `fix(...)`: Sửa lỗi phát sinh.
  - `refactor(...)`: Tối ưu code không đổi logic nghiệp vụ.
  - `docs(...)`: Cập nhật tài liệu.
- Luôn kiểm tra `git status` và `git diff` trước khi commit.
