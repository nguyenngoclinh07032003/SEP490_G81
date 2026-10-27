---
name: ai-chatbot-evaluation
description: >-
  Use this skill when designing, evaluating, testing, benchmark-measuring, and reporting AI or Chatbot features in a Capstone project.
  Inspired by Workshop #03: "Đánh giá AI & Chatbot trong đồ án tốt nghiệp: Từ Prompt đến báo cáo" (Thầy Bùi Trung Hiếu).
---

# AI & Chatbot Evaluation in Capstone Projects

Cẩm nang thiết kế Prompt chuyên sâu, đánh giá hiệu năng Chatbot/AI và lập bảng số liệu thực nghiệm báo cáo trước Hội đồng chấm đồ án.

## 1. Thiết kế Prompt có cấu trúc (Structured Prompt Engineering)
Một Prompt cho AI/Chatbot trợ lý (ví dụ: Chatbot tư vấn sửa chữa, gợi ý dịch vụ) phải có đầy đủ 4 thành phần:
1. **Role / Persona (Vai trò)**: Bạn là chuyên gia tư vấn kỹ thuật điện lạnh và dịch vụ bảo trì tại nhà của Dịch Vụ Minh Đức.
2. **Context & Constraints (Bối cảnh & Giới hạn)**:
   - Chỉ trả lời trong phạm vi các dịch vụ và bảng giá hiện có của Minh Đức.
   - Nếu khách hàng hỏi vấn đề ngoài phạm vi, lịch sự từ chối và hướng dẫn liên hệ Hotline 1900 6868.
   - Không được bịa đặt thông tin kỹ thuật hoặc cam kết giá sai lệch (Anti-Hallucination).
3. **Task & Instructions (Nhiệm vụ cụ thể)**: Hướng dẫn người dùng chẩn đoán sơ bộ hiện tượng lỗi thiết bị và gợi ý đặt lịch thợ kiểm tra.
4. **Output Format (Định dạng đầu ra)**: Trình bày câu trả lời ngắn gọn, có cấu trúc bullet point rõ ràng, giọng văn thân thiện, lịch sự.

## 2. Tiêu chí đánh giá AI & Chatbot (Evaluation Metrics)
Để bảo vệ thuyết phục trước Hội đồng, đồ án không thể chỉ nói "AI hoạt động tốt", mà phải có số liệu thực nghiệm:
- **Accuracy / Relevance (Độ chính xác & liên quan)**: Tỷ lệ câu trả lời khớp với tri thức dịch vụ (Mục tiêu: > 90%).
- **Hallucination Rate (Tỷ lệ ảo giác/bịa đặt)**: Đo lường số lần chatbot cung cấp thông tin không có trong tài liệu cơ sở (Mục tiêu: < 3%).
- **Latency / Response Time (Độ trễ phản hồi)**: Thời gian từ lúc user gửi tin nhắn đến khi nhận từ đầu tiên (Time to First Token - TTFT < 1.5s).
- **Fallback Rate (Tỷ lệ chuyển tiếp nhân viên hỗ trợ)**: Tỷ lệ câu hỏi vượt quá khả năng cần chuyển cho điều phối viên.
- **User Satisfaction (Độ hài lòng người dùng)**: Điểm đánh giá CSAT (thang điểm 1 - 5).

## 3. Quy trình thực nghiệm & Lập báo cáo đồ án
1. **Chuẩn bị Test Dataset**: Xây dựng bộ dữ liệu kiểm thử gồm ít nhất 50 - 100 câu hỏi mẫu đại diện (Câu hỏi thông thường, câu hỏi hóc búa, câu hỏi nhiễu/ngoài phạm vi).
2. **Chạy kiểm thử & Chấm điểm**: So sánh kết quả đầu ra với đáp án chuẩn (Ground Truth) do chuyên gia/sinh viên thẩm định.
3. **Trình bày biểu đồ trong Slide & Báo cáo**:
   - Biểu đồ phân bố độ chính xác theo từng danh mục thiết bị (Điều hòa, Tủ lạnh, Máy giặt).
   - Bảng so sánh trước và sau khi tối ưu Prompt (Prompt Iteration A/B Testing).
