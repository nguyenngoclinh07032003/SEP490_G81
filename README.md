# HRMSS

Backend Express/PostgreSQL/Redis. Xem backend/README.md để chạy và thử API.

- PostgreSQL mới 5432: hrmss (32 bảng), hrmss_auth (6 bảng).
- BE dùng hrmss_auth; user/owner nhattq. API 5000, Redis 6380.
- Server cũ chuyển 5434; cluster cũ 55440 đã dừng.
- Sau restart: npm run dev:services rồi npm run dev.
- Signup/login/logout và ADMIN tạo tài khoản đã có; refresh chưa triển khai.
