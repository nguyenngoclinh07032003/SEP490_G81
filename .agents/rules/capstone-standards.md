# BỘ 6 TIÊU CHUẨN ĐỒ ÁN CAPSTONE (FPT UNIVERSITY WORKSHOPS)

Toàn bộ quá trình code, refactor, review và tài liệu hóa trong dự án này phải tuân thủ 6 trụ cột kỹ thuật:

1. **Lập kế hoạch & Quản lý tiến độ (Workshop #01 - Thầy Nguyễn Trung Kiên)**:
   - Phân rã công việc WBS thành Epic, User Story, Task kỹ thuật (4-8h/task) có Acceptance Criteria rõ ràng.
   - Quản lý theo Sprint, ưu tiên tính năng theo mô hình MoSCoW, chủ động kiểm soát rủi ro.

2. **Phân tích & Thiết kế trước khi Code (Workshop #02 - Thầy Ngô Tuấn Khiêm)**:
   - Làm rõ Use Case, Pre/Post-conditions, luồng chính và luồng ngoại lệ.
   - Thiết kế CSDL chuẩn hóa 3NF, có khóa chính/ngoại, index và cột audit (`created_at`, `updated_at`).
   - Thiết kế RESTful API contract rõ ràng, phản hồi thống nhất `{ success, message, data }`.

3. **Đánh giá AI & Chatbot thực nghiệm (Workshop #03 - Thầy Bùi Trung Hiếu)**:
   - Thiết kế Prompt theo cấu trúc: Role, Context/Constraints, Task, Output Format.
   - Có bộ chỉ số đo lường: Accuracy (>90%), Hallucination (<3%), Latency (<1.5s), CSAT.
   - Chuẩn bị test dataset thực nghiệm để có số liệu khoa học bảo vệ trước Hội đồng.

4. **Tư duy Triển khai Thực tế - From Code to Production (Workshop #04 - Thầy Phạm Quang Khang)**:
   - Không bao giờ hardcode localhost, port hay credentials. 100% dùng `.env` (`process.env` / `import.meta.env`).
   - Tách biệt Code và Config, gom toàn bộ API client vào `services/` có `index.js`.
   - Khả năng chịu lỗi (Graceful degradation): Redis/dịch vụ ngoài down thì app vẫn chạy và log cảnh báo, không crash server.
   - Sẵn sàng đóng gói Docker Compose và deploy lên VPS/Cloud với Nginx + HTTPS.

5. **Chất lượng phần mềm trong kỷ nguyên Vibe-Coding (Workshop #05 - Cô Doãn Thị Xuân)**:
   - Kiểm thử tự động, bắt buộc chạy `npm run build` không có lỗi trước khi commit.
   - Kiểm tra các giá trị biên (edge cases): null, undefined, chuỗi rỗng, lỗi mạng.
   - Giữ code sạch (DRY, Modularity), loại bỏ code chết, commit có kỷ luật (Conventional Commits).

6. **Đạo đức, Liêm chính & Trách nhiệm với AI (Workshop #06 - Thầy Nguyễn Cường Mạnh)**:
   - AI là người cộng sự (Pair Programmer) hỗ trợ tăng tốc, sinh viên là người chịu trách nhiệm cuối cùng.
   - Phải hiểu rõ từng dòng code để tự tin trả lời vấn đáp Hội đồng ("Tại sao làm thế này?").
   - Bảo vệ dữ liệu nhạy cảm (không đưa secret/passwords lên AI công cộng), tuân thủ an toàn bảo mật OWASP.
