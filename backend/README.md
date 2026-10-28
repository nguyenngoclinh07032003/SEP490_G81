# HRMSS — Development hiện tại

## Kết nối
- PostgreSQL mới: 127.0.0.1:5432, user/owner nhattq; mật khẩu lấy từ backend/.env (không commit).
- DB hrmss: 32 bảng đầy đủ trong schema hrmss.
- DB hrmss_auth: 6 bảng User/auth trong schema hrmss; BE dùng DB này.
- API: http://localhost:5000/api/v1. Health: /health, readiness: /health/ready.
- Redis giữ nguyên 127.0.0.1:6380, mật khẩu trong backend/.env.
- Server PostgreSQL cũ (Windows Service postgresql-x64-17) chuyển sang 5434, giữ nguyên dữ liệu.
- Cluster Development cũ cổng 55440 đã dừng, dữ liệu còn ở .local/postgres do thao tác xóa bị chặn. Cluster mới đang dùng .local/postgres-dev. Không bật cluster cũ.

User nhattq là tài khoản quản trị bootstrap cluster Development, có SUPERUSER. Không dùng cấu hình này ở Production. Các mật khẩu mẫu dễ nhớ chỉ dùng Development/Test.

## Chạy sau restart
Tại root dự án:
```powershell
npm run dev:services
npm run dev
```
Launcher dùng PostgreSQL 17 và Redis portable hiện có trong .local. Không tạo lại cluster, không reset dữ liệu. Nếu cổng 5000 đang được dùng, dừng API cũ trước khi chạy thêm.

## Schema và seed
- database/hrmss_full.sql: baseline DB đầy đủ hrmss, 32 bảng.
- database/hrmss_auth.sql (và database.sql): baseline DB hrmss_auth, 6 bảng.
- Chỉ chạy baseline vào DB trống. Không chạy nối tiếp hai baseline trong cùng DB.

```powershell
npm run seed:dev --workspace backend -- hrmss
npm run seed:dev --workspace backend -- hrmss_auth
```
Mỗi DB có đúng một account cho mỗi role. Seed đọc .local/dev-accounts.json, không overwrite khi dữ liệu hiện có khác fixture; chạy lại không tạo trùng. Full DB còn có một customer liên kết tài khoản CUSTOMER; mỗi DB có một trạng thái vị trí Technician tắt chia sẻ. Chưa seed toàn bộ quy trình sửa chữa/thanh toán.

## API đã có
| Method | URL sau /api/v1 | Quyền |
|---|---|---|
| GET | /health | Công khai |
| GET | /health/ready | Công khai |
| POST | /auth/signup | Công khai, luôn CUSTOMER |
| POST | /auth/login | Công khai |
| POST | /auth/refresh | Refresh cookie + Origin hợp lệ, body {} |
| GET | /auth/me | Bearer token hợp lệ |
| POST | /auth/logout | Bearer token hoặc refresh cookie + Origin, body {} |
| POST | /auth/logout-all | Bearer token, body {} |
| POST | /admin/accounts | ACTIVE ADMIN + user.create |

Login body: {"identifier":"<username hoặc email>","password":"<password>"}. Lấy data.access_token gửi Authorization: Bearer <token>.
Signup/create body: username, email, password, confirm_password, full_name, phone (tùy chọn). API tạo nội bộ thêm role: ADMIN/MANAGER/OFFICE_STAFF/TECHNICIAN. Signup không nhận role/status. Password 8–64 ký tự, không trim. Account/profile cùng transaction; password async scrypt có salt, mapper không trả hash.

Phiên Redis dùng opaque Bearer token TTL 15 phút và refresh token ngẫu nhiên trong cookie HttpOnly `hrmss_refresh`. Mỗi login tạo nhóm phiên riêng, hết hạn tuyệt đối sau 7 ngày; rotation không gia hạn. Redis chỉ lưu hash token. Role/status lấy lại từ DB mỗi request và khi refresh. Giới hạn login 20/IP/15 phút.

### Refresh và thu hồi phiên
- Login/refresh giữ envelope và các trường access_token, token_type, expires_in, account; refresh token chỉ xuất hiện trong Set-Cookie, không trong JSON.
- POST /auth/refresh dùng body {}, cookie và Origin đúng CORS_ORIGIN. FE gọi fetch với credentials: 'include'; không cần Bearer. Refresh token chỉ dùng một lần; Lua rotation nguyên tử. FE phải gộp yêu cầu refresh để tránh refresh đồng thời, kể cả giữa nhiều tab.
- Hash refresh đã dùng tồn tại đến hết hạn để phát hiện replay. Dùng lại token cũ thu hồi cả nhóm, bao gồm access token mới. Access token trước rotation vẫn hợp lệ đến hết TTL nếu nhóm chưa bị thu hồi.
- Logout bằng Bearer vẫn tương thích; khi access token hết hạn có thể logout bằng refresh cookie + Origin. Logout thu hồi nhóm hiện tại và xóa cookie. Logout-all thu hồi các nhóm hiện có của user, bao gồm access token kiểu cũ; login sau đó tạo phiên mới bình thường.
- Token access kiểu cũ (Redis value chỉ có user_id) vẫn dùng được đến hết TTL/logout; cần login lại để có refresh cookie.
- Refresh thiếu/sai/hết hạn hoặc tài khoản không ACTIVE: 401 và xóa cookie. Origin sai/thiếu khi dùng cookie: 403. Redis lỗi: 503, không xóa cookie để có thể thử lại.
- Cookie host-only, Path=/api/v1/auth, SameSite=lax mặc định. Local HTTP dùng REFRESH_COOKIE_SECURE=false. Production luôn Secure (không cho cấu hình false), yêu cầu HTTPS. Nếu FE/API khác site, đặt REFRESH_COOKIE_SAME_SITE=none và REFRESH_COOKIE_SECURE=true; CORS_ORIGIN phải là origin FE chính xác. Cookie bên thứ ba vẫn phụ thuộc chính sách trình duyệt.
- Mọi login/logout có Origin đều kiểm tra allowlist; refresh và logout bằng cookie bắt buộc Origin. CORS riêng lẻ không được dùng thay kiểm tra CSRF này.
- Thu hồi nhóm tạo blacklist của family và xóa family key; các token hash còn lại tự hết TTL. Logout-all đổi generation ngẫu nhiên của user; generation được giữ để phiên cũ không thể sống lại. Mất generation key cũng khiến phiên bị từ chối.

### Blacklist trong Redis
- Blacklist là danh sách từ chối token/nhóm phiên bị thu hồi trước khi hết hạn. Token đã hết hạn hoặc không tồn tại bị từ chối trực tiếp, không tạo bản ghi blacklist.
- Key `hrmss:auth:blacklist:access:<sha256>` chặn access token; `hrmss:auth:blacklist:refresh:<sha256>` đánh dấu refresh token đã dùng/thu hồi; `hrmss:auth:blacklist:family:<id>` chặn toàn bộ nhóm. Không lưu token thô.
- Rotation nguyên tử ghi refresh token cũ vào blacklist với lý do `rotated`. Khi token này xuất hiện lại, server vẫn kiểm tra replay và thu hồi nhóm; không chỉ trả 401 rồi bỏ qua việc thu hồi.
- Logout bằng Bearer ghi blacklist access token và nhóm; logout bằng cookie ghi blacklist refresh token và nhóm. Những token khác trong nhóm bị chặn ngay bởi family/generation; khi access token đó được gửi lại, hash của nó cũng được ghi blacklist.
- Logout-all đổi generation trước để chặn ngay các phiên cũ, sau đó SCAN theo đợt và ghi blacklist cho access/refresh token thuộc generation vừa thu hồi, kể cả access token kiểu cũ. Phiên của user khác và phiên login sau mốc đổi generation được giữ nguyên. Nếu thao tác Redis lỗi, API trả 503; việc thu hồi đã thực hiện không bị hoàn tác.
- TTL blacklist bằng TTL còn lại của token/nhóm lúc bị thu hồi, tự xóa khi hết hạn. Thao tác lặp không kéo dài TTL hoặc ghi đè lý do đầu tiên. Không có blacklist vĩnh viễn và không cần job dọn.
- Kiểm tra blacklist nằm trong repository cùng các thao tác Lua; Redis lỗi trả 503, không cho qua bước xác thực. API và định dạng response không thay đổi.

## Cấu trúc
route -> controller -> service -> repository -> database; model chỉ cấu hình bảng/cột/khóa/cột ẩn. SQL có tham số, credentials login tách khỏi dữ liệu công khai. Mọi API bảo vệ cần kiểm tra authentication + permission + ownership phù hợp.
Response thành công: success, code, message, data, meta.requestId. Lỗi thêm errors, data=null. 400 input, 401 auth, 403 quyền, 404 route, 409 trùng, 413 body lớn, 429 rate limit, 500 nội bộ, 503 dependency.

## Kiểm thử
npm test: unit/API tests; integration PostgreSQL chỉ chạy khi có PG_TEST_DATABASE_URL trỏ DB test riêng đã nạp schema. Không dùng DB đang làm việc cho các bài này.

Test vòng đời refresh với Redis thật (namespace ngẫu nhiên, tự dọn): `$env:REDIS_SESSION_TEST='1'; node --test backend/test/refresh-session.test.js`. Dữ liệu user được giả lập; nếu đồng thời đặt PG_TEST_DATABASE_URL tới DB TEST riêng, bài HTTP login/refresh/logout-all dùng cả PostgreSQL và Redis thật. Bỏ biến REDIS_SESSION_TEST sau khi chạy. Không dùng FLUSHDB/FLUSHALL.
node backend/scripts/verify-dev.js: kiểm thử HTTP với DB/Redis thực, tạo fixture tạm và dọn chúng sau test; không chạy liên tục vì giới hạn login. Đã đạt 84 check, xác minh cả hash/role ở hai DB. Kết quả ở .local/dev-verification.json.

## Chưa triển khai
Danh sách/sửa/khóa/đổi role tài khoản qua API, bảo vệ ADMIN cuối cùng, sửa hồ sơ/đổi mật khẩu, audit quản trị, FE, các nghiệp vụ sửa chữa/thanh toán đầy đủ.

.env, .local, node_modules và log đã gitignore. Không commit mật khẩu thực hoặc file report tài khoản Development.
