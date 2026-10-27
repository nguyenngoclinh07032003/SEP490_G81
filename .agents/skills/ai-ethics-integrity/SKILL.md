---
name: ai-ethics-integrity
description: >-
  Use this skill to guide academic integrity, ethical AI usage, intellectual property, data privacy, and transparent explanation of AI-assisted code for Capstone projects.
  Inspired by Workshop #06: "Trách nhiệm, Đạo đức & Liêm chính khi làm việc cùng AI" (Thầy Nguyễn Cường Mạnh).
---

# Ethics, Responsibility & Academic Integrity with AI

Cẩm nang về trách nhiệm, đạo đức học thuật và tính liêm chính khi ứng dụng AI trong quá trình nghiên cứu, phát triển đồ án tốt nghiệp Capstone.

## 1. Định vị AI: "Người cộng sự (Pair Programmer), không phải người làm hộ"
- AI là công cụ tăng tốc năng suất (Productivity Booster), không thay thế tư duy phản biện, kỹ năng giải quyết vấn đề và trách nhiệm cá nhân của kỹ sư phần mềm.
- Lập trình viên là người chịu trách nhiệm cuối cùng (Accountable) cho từng dòng code, tính ổn định và tính bảo mật của sản phẩm khi bàn giao hoặc đưa ra Hội đồng bảo vệ.

## 2. Nguyên tắc Liêm chính học thuật (Academic Integrity)

### Hiểu sâu từng dòng code (Understand Every Line)
- **Quy tắc vàng**: Không bao giờ đưa vào đồ án đoạn code mà bạn không thể giải thích cặn kẽ trước Hội đồng phản biện.
- Khi AI hỗ trợ sinh code:
  - Yêu cầu AI giải thích tường tận nguyên lý hoạt động, cấu trúc giải thuật và lý do lựa chọn giải pháp đó thay vì giải pháp khác.
  - Chuẩn bị sẵn câu trả lời cho các câu hỏi chất vấn điển hình: *"Tại sao lại chọn cấu trúc bảng này?", "Thuật toán này có độ phức tạp thời gian/không gian là bao nhiêu?", "Nếu có 10.000 user đồng thời thì hệ thống nghẽn ở đâu?"*.

### Minh bạch về việc sử dụng AI (Transparency & Attribution)
- Ghi nhận và khai báo trung thực các phần công việc có sự hỗ trợ của công cụ AI (ví dụ: hỗ trợ sinh test case, refactor cú pháp, dịch thuật ngữ, tối ưu câu truy vấn SQL).
- Không đạo văn, không sao chép trái phép mã nguồn từ các dự án mã nguồn đóng hoặc vi phạm giấy phép (License Violation - GPL, MIT, Apache).

## 3. Bảo vệ dữ liệu & Quyền riêng tư (Data Privacy & Security)
- **Dữ liệu nhạy cảm**: Tuyệt đối không gửi các khóa bí mật (API Keys, Private Keys, Passwords, Token) hoặc dữ liệu cá nhân thật (PII - CCCD, số thẻ ngân hàng, số điện thoại thật) vào các mô hình AI công cộng.
- **Tuân thủ quy chuẩn bảo mật**: Mã nguồn sinh ra phải có cơ chế mã hóa mật khẩu một chiều (bcrypt), kiểm tra quyền truy cập (RBAC), chống tấn công SQL Injection và rà soát các lỗ hổng OWASP Top 10.

## 4. Trách nhiệm xã hội & Tính công bằng của sản phẩm
- Đảm bảo phần mềm được xây dựng không có yếu tố thiên kiến (Bias) hoặc gây hại cho người dùng.
- Giao diện thân thiện, dễ tiếp cận (Accessibility), tôn trọng quyền riêng tư và quyền kiểm soát dữ liệu của người sử dụng cuối cùng.
