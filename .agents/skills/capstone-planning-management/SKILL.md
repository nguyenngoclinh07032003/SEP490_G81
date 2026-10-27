---
name: capstone-planning-management
description: >-
  Use this skill for planning, organizing, breaking down tasks, tracking sprints, and managing Capstone project progress.
  Inspired by Workshop #01: "Lập kế hoạch, triển khai và quản lý dự án Capstones" (Thầy Nguyễn Trung Kiên).
---

# Capstone Planning & Project Management Skill

Quy chuẩn và cẩm nang hướng dẫn lập kế hoạch, triển khai và quản lý tiến độ đồ án Capstone theo mô hình Agile/Scrum chuyên nghiệp.

## 1. Mục tiêu cốt lõi
- Phân rã mục tiêu lớn của đồ án thành các Epic, User Story và Task kỹ thuật có tính khả thi cao.
- Kiểm soát tiến độ theo từng giai đoạn (Sprint) 1 - 2 tuần, đảm bảo mỗi tuần đều có sản phẩm demo được (Deliverable).
- Quản lý rủi ro (Risk Management) và giải quyết các điểm nghẽn (Blockers) kịp thời.

## 2. Quy trình phân rã công việc (Work Breakdown Structure - WBS)
Khi người dùng yêu cầu lên kế hoạch cho một tính năng hoặc một Sprint:
1. **Epic Level**: Xác định nghiệp vụ lớn (VD: Phân hệ Quản lý Dịch vụ & Điều phối thợ).
2. **User Story Level**: Viết theo chuẩn:
   - *"Là một [Vai trò], tôi muốn [Hành động] để [Lợi ích]"*.
   - Kèm theo **Tiêu chí nghiệm thu (Acceptance Criteria - AC)** rõ ràng.
3. **Task Level**: Chia nhỏ thành các task kỹ thuật cụ thể (Backend API, DB Migration, Frontend UI, Test case). Mỗi task không quá 4 - 8 giờ làm việc.

## 3. Khung thời gian quản lý Sprint (Sprint Cadence)
- **Sprint Planning**: Đầu tuần xác định mục tiêu Sprint (Sprint Goal) và các story cam kết hoàn thành.
- **Daily Check-in**: 3 câu hỏi nhanh: Hôm qua làm gì? Hôm nay làm gì? Có vướng mắc (blocker) gì không?
- **Sprint Review & Demo**: Cuối tuần tổng hợp kết quả, demo sản phẩm thật chạy trên web/app.
- **Sprint Retrospective**: Rút kinh nghiệm về quy trình, giao tiếp và kỹ thuật cho sprint tiếp theo.

## 4. Quản lý rủi ro dự án Capstone
- **Rủi ro kỹ thuật**: Công nghệ mới, API bên thứ ba thay đổi hoặc chưa nắm vững ➔ Luôn làm PoC (Proof of Concept) nhỏ trước khi tích hợp đại trà.
- **Rủi ro nhân sự**: Khối lượng công việc phân bổ không đều ➔ Bảng phân công rõ ràng, tài liệu hóa code để thành viên khác có thể tiếp quản.
- **Rủi ro phạm vi (Scope Creep)**: Ý tưởng nảy sinh quá nhiều làm trễ hạn ➔ Xếp hạng ưu tiên theo MoSCoW (Must-have, Should-have, Could-have, Won't-have); chỉ tập trung làm xuất sắc phần Must-have trước.
