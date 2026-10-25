# 📘 CẨM NANG HƯỚNG DẪN DOCKER & REDIS CHO DỰ ÁN HRMSS
*(Dành cho thành viên nhóm SEP490-G81 - Dễ hiểu từ cơ bản đến nâng cao)*

---

## 📌 MỤC LỤC
1. [Bản chất: Docker & Redis là gì?](#1-bản-chất-docker--redis-là-gì)
2. [Cách dùng hàng ngày (Cheat Sheet lệnh)](#2-cách-dùng-hàng-ngày-cheat-sheet-lệnh)
3. [Cách xem và thao tác trên giao diện Docker Desktop](#3-cách-thao-tác-trên-giao-diện-docker-desktop)
4. [Cách gọi và sử dụng Redis trong code Backend](#4-cách-gọi-và-sử-dụng-redis-trong-code-backend)
5. [Ví dụ thực tế: Token Blacklist & Chống Brute-Force](#5-ví-dụ-thực-tế-trong-dự-án)
6. [Xử lý các lỗi thường gặp (Troubleshooting)](#6-xử-lý-các-lỗi-thường-gặp)
7. [Cách Deploy lên Server VPS ngày bảo vệ Đồ án](#7-cách-deploy-lên-vps-ngày-bảo-vệ-đồ-án)

---

## 1. BẢN CHẤT: DOCKER & REDIS LÀ GÌ?

### 🐳 Docker là gì?
* **Khái niệm:** Giống như một **chiếc thùng Container chở hàng**. Docker đóng gói toàn bộ phần mềm (PostgreSQL, Redis...) cùng hệ điều hành Linux tí hon vào một thùng kín.
* **Lợi ích:** Mang chiếc thùng đó sang máy tính Windows, máy Mac hay máy chủ Linux trên mây thì **nó chạy y hệt nhau 100%**, không lo rác máy tính cá nhân và không lo lỗi môi trường.

### ⚡ Redis là gì?
* **Khái niệm:** Là một cơ sở dữ liệu **chạy trực tiếp trên RAM** (In-Memory Data Store), tốc độ đọc/ghi cực nhanh (< 2 mili-giây).
* **Nhiệm vụ trong dự án HRMSS:**
  1. **Token Blacklist:** Vô hiệu hóa Access Token ngay lập tức khi người dùng bấm Đăng xuất (Logout).
  2. **Chống Brute-Force (JOB-01):** Khóa tạm thời tài khoản 15 phút nếu nhập sai mật khẩu quá 5 lần.
  3. **Lưu mã OTP:** Lưu mã xác nhận gửi qua SMS/Email tự động biến mất sau 3 - 5 phút.
  4. **Cache Bảng giá dịch vụ:** Giúp khách mở App xem giá không làm nghẽn PostgreSQL.

---

## 2. CÁCH DÙNG HÀNG NGÀY (CHEAT SHEET LỆNH)

> **Mẹo:** Bạn chỉ cần mở Terminal tại thư mục gốc của dự án (`SEP490_G81`).

| Mục đích | Lệnh chạy trong Terminal | Giải thích |
| :--- | :--- | :--- |
| **Bật Redis** | `docker compose up -d redis` | Docker sẽ khởi động container `hrmss-redis` chạy ngầm. |
| **Kiểm tra trạng thái** | `docker ps` | Xem container nào đang chạy (status Up). |
| **Xem log dữ liệu** | `docker compose logs -f redis` | Xem dữ liệu cache ra/vào theo thời gian thực (nhấn `Ctrl + C` để thoát). |
| **Tắt tạm thời** | `docker compose stop redis` | Tắt container để tiết kiệm RAM khi nghỉ làm việc. |
| **Tắt và dọn dẹp** | `docker compose down` | Tắt hoàn toàn container. |

---

## 3. CÁCH THAO TÁC TRÊN GIAO DIỆN DOCKER DESKTOP

Nếu bạn không muốn gõ lệnh, hãy dùng chuột trên phần mềm **Docker Desktop**:

1. **Xem Container:** Mở Docker Desktop $\rightarrow$ chọn mục **Containers** bên trái:
   * Chấm **Xanh lá cây** = Đang hoạt động bình thường.
   * Nút **Square (Dừng)** = Tắt Redis.
   * Nút **Triangle (Play)** = Bật Redis.
2. **Kiểm tra dữ liệu bên trong Redis:**
   * Bấm chuột thẳng vào tên `hrmss-redis`.
   * Chọn tab **`Exec`** (màn hình dòng lệnh đen sì hiện ra).
   * Gõ các lệnh kiểm tra:
     ```bash
     redis-cli ping           # Nếu trả về PONG là Redis đang sống rất tốt
     redis-cli keys *         # Liệt kê tất cả các key/token đang lưu trong RAM
     redis-cli get <tên_key>  # Xem giá trị cụ thể của một key
     redis-cli flushall       # Xóa sạch toàn bộ cache (khi cần reset dữ liệu test)
     ```

> ⚠️ **LƯU Ý CỰC KỲ QUAN TRỌNG:**  
> **Không bấm mở đường link `localhost:6379` trên trình duyệt Web (Chrome, Edge)!**  
> Redis là cơ sở dữ liệu nhị phân, **không phải là trang web**. Mở bằng Chrome sẽ bị báo lỗi mạng hoặc bị Redis cảnh báo bảo mật. Điều này hoàn toàn bình thường.

---

## 4. CÁCH GỌI VÀ SỬ DỤNG REDIS TRONG CODE BACKEND

Toàn bộ kết nối Redis đã được cấu hình sẵn trong file `backend/config/redis.js`. Trong bất kỳ file controller hoặc middleware nào, bạn chỉ cần gọi như sau:

```javascript
// 1. Import kết nối Redis đã tạo sẵn
import redisClient from '../config/redis.js';

// 2. Lưu một giá trị vào Redis (kèm thời gian tự hủy EX tính bằng GIÂY)
// Ví dụ: Lưu mã OTP sống trong 300 giây (5 phút)
await redisClient.set(`otp:${phone}`, '849201', { EX: 300 });

// 3. Đọc một giá trị từ Redis
const otp = await redisClient.get(`otp:${phone}`);

// 4. Xóa một key khỏi Redis
await redisClient.del(`otp:${phone}`);

// 5. Kiểm tra key có tồn tại không (trả về 1 nếu có, 0 nếu không)
const exists = await redisClient.exists(`otp:${phone}`);
```

---

## 5. VÍ DỤ THỰC TẾ TRONG DỰ ÁN

### Ví dụ 1: Xử lý Đăng xuất & Thu hồi Token (JWT Token Blacklist)
```javascript
// controllers/auth.controller.js
import redisClient from '../config/redis.js';
import jwt from 'jsonwebtoken';

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'Không có token' });

    // Giải mã token để biết thời gian hết hạn còn lại
    const decoded = jwt.decode(token);
    const timeLeft = decoded.exp - Math.floor(Date.now() / 1000);

    if (timeLeft > 0) {
      // Đẩy token vào Redis Blacklist, hết timeLeft giây Redis tự động xóa
      await redisClient.set(`blacklist:${token}`, 'revoked', { EX: timeLeft });
    }

    return res.status(200).json({ message: 'Đăng xuất thành công!' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
```

### Ví dụ 2: Middleware chặn Token đã bị Logout
```javascript
// middleware/auth.middleware.js
import redisClient from '../config/redis.js';
import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Vui lòng đăng nhập' });

    // 1. Kiểm tra nhanh trong Redis (mất < 1ms)
    const isRevoked = await redisClient.get(`blacklist:${token}`);
    if (isRevoked) {
      return res.status(401).json({ message: 'Token đã bị vô hiệu hóa (Đã đăng xuất)' });
    }

    // 2. Kiểm tra tính hợp lệ của JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};
```

---

## 6. XỬ LÝ CÁC LỖI THƯỜNG GẶP (TROUBLESHOOTING)

1. **Lỗi `ECONNREFUSED 127.0.0.1:6379`:**
   * **Nguyên nhân:** Bạn chưa bật Docker Desktop hoặc chưa chạy container Redis.
   * **Cách sửa:** Mở Docker Desktop $\rightarrow$ Bấm nút Play ở container `hrmss-redis` (hoặc gõ terminal `docker compose up -d redis`).
2. **Cảnh báo `Possible SECURITY ATTACK detected...` trong log Redis:**
   * **Nguyên nhân:** Do bạn vừa click mở đường link `localhost:6379` trên trình duyệt web.
   * **Cách sửa:** Không mở cổng 6379 bằng trình duyệt. Đây chỉ là cảnh báo tự vệ của Redis, không gây lỗi hệ thống.
3. **Quên mật khẩu / Xung đột môi trường:**
   * Trong file `.env` local của máy tính, để `REDIS_PASSWORD=` trống, không cần điền gì cả.

---

---

## 7. CÁCH DEPLOY LÊN VPS NGÀY BẢO VỆ ĐỒ ÁN (HƯỚNG DẪN CHI TIẾT TỪ A - Z)

Để bảo vệ đồ án tốt nghiệp, nhóm bạn nên thuê 1 VPS (máy chủ ảo trên đám mây, giá khoảng 100k - 150k/tháng) để hệ thống chạy online 24/24, thầy cô ngồi dưới hội đồng có thể cầm điện thoại thật test ứng dụng trực tiếp.

Dưới đây là **7 bước cụ thể, chi tiết từng câu lệnh** từ lúc thuê VPS đến khi ứng dụng chạy online:

---

### 🔹 Bước 7.1: Thuê VPS (Máy chủ ảo)
* **Nhà cung cấp uy tín:** Vietnix, KDATA, TinoHost (Việt Nam) hoặc DigitalOcean, Hetzner, AWS Lightsail (Quốc tế).
* **Cấu hình tối thiểu khuyên dùng:**
  * **Hệ điều hành:** `Ubuntu 22.04 LTS` hoặc `Ubuntu 24.04 LTS` (64-bit).
  * **CPU:** 2 vCPU.
  * **RAM:** 2GB hoặc 4GB RAM.
  * **Ổ cứng:** 25GB SSD trở lên.
* Khi thuê xong, bạn sẽ nhận được:
  * **Địa chỉ IP của VPS** (Ví dụ: `103.123.45.67`).
  * **Tài khoản:** Thường là `root`.
  * **Mật khẩu quản trị** (do nhà cung cấp gửi về email).

---

### 🔹 Bước 7.2: Đăng nhập vào VPS từ máy tính Windows của bạn
1. Mở cửa sổ **Terminal** hoặc **PowerShell** trên Windows của bạn lên.
2. Gõ lệnh kết nối SSH:
   ```bash
   ssh root@103.123.45.67
   ```
   *(Thay `103.123.45.67` bằng địa chỉ IP thật của VPS bạn đã thuê).*
3. Lần đầu tiên kết nối, màn hình hỏi: `Are you sure you want to continue connecting (yes/no)?` $\rightarrow$ Bạn gõ `yes` rồi nhấn Enter.
4. Nhập mật khẩu VPS:
   > ⚠️ **LƯU Ý:** Khi gõ mật khẩu trên Linux, màn hình sẽ **KHÔNG HIỆN DẤU SAO `*` hay ký tự nào** (đây là tính năng bảo mật của Linux để người ngồi cạnh không đếm được số ký tự). Bạn cứ bình tĩnh gõ đúng mật khẩu rồi bấm **Enter**.

Màn hình hiện ra `root@ubuntu:~#` là bạn đã vào bên trong máy chủ VPS thành công!

---

### 🔹 Bước 7.3: Cài đặt Docker & Docker Compose trên VPS
Chỉ cần chạy 2 lệnh sau:

```bash
# 1. Cập nhật hệ thống Ubuntu
sudo apt update && sudo apt upgrade -y

# 2. Cài đặt Docker tự động chính hãng (Mất khoảng 1 - 2 phút)
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
```

Kiểm tra xem Docker đã cài thành công chưa:
```bash
docker --version && docker compose version
```
*(Nếu hiện ra Docker version 27.x và Docker Compose version v2.x là thành công 100%)*.

---

### 🔹 Bước 7.4: Tải mã nguồn dự án từ GitHub về VPS
Chạy lệnh clone repository của nhóm:
```bash
# 1. Tải toàn bộ code của nhóm về VPS
git clone https://github.com/nguyenngoclinh07032003/SEP490_G81.git

# 2. Đi vào thư mục dự án
cd SEP490_G81

# 3. Chuyển sang nhánh bạn đang làm việc (ví dụ nhánh khanh)
git checkout khanh
```

---

### 🔹 Bước 7.5: Tạo file môi trường `.env` trên VPS
Trên VPS, tạo file `.env` cho backend bằng trình soạn thảo `nano`:
```bash
nano backend/.env
```
Cửa sổ soạn thảo hiện ra, bạn dán nội dung cấu hình sản phẩm vào:
```env
PORT=5000
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=MatKhauBaoMat2026@
DB_NAME=hrmss
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
```
* **Lưu lại:** Nhấn tổ hợp phím **`Ctrl + O`** $\rightarrow$ nhấn **`Enter`**.
* **Thoát ra:** Nhấn **`Ctrl + X`**.

---

### 🔹 Bước 7.6: Kích hoạt toàn bộ hệ sinh thái bằng Docker Compose
Vẫn đứng tại thư mục `SEP490_G81`, gõ đúng 1 câu lệnh duy nhất:
```bash
docker compose up -d --build
```

**Quá trình tự động diễn ra:**
1. Docker tải PostgreSQL 16 và Redis 7 về.
2. Docker tự đọc file [backend/Dockerfile](file:///c:/Users/xuank/Downloads/%C4%90%E1%BB%93%20%C3%A1n%20SEP490/SEP490_G81/backend/Dockerfile) để đóng gói Backend Express.
3. Cả 3 container (`hrmss-postgres`, `hrmss-redis`, `hrmss-backend`) sẽ tự động bật lên và nối mạng nội bộ bảo mật với nhau!

---

### 🔹 Bước 7.7: Khởi tạo 29 bảng Database vào PostgreSQL trên VPS
Sau khi container đã bật, bạn chỉ cần chạy **đúng 1 lệnh** để nạp toàn bộ file schema SQL vào database:
```bash
docker exec -i hrmss-postgres psql -U postgres -d hrmss < database/Database/hrmss_schema.sql
```
*(Chờ khoảng 2 giây, toàn bộ 29 bảng dữ liệu, các hàm trigger, ràng buộc khóa ngoại và 5 Roles người dùng sẽ được tạo xong xuôi).*

---

### 🔹 Bước 7.8: Kiểm tra kết quả & Mở cổng tường lửa (Firewall)
1. **Kiểm tra xem các container có đang chạy không:**
   ```bash
   docker ps
   ```
   Bạn sẽ thấy 3 container `hrmss-backend`, `hrmss-postgres`, `hrmss-redis` đều có trạng thái `Up`.
2. **Xem log Backend:**
   ```bash
   docker logs -f hrmss-backend
   ```
   Sẽ thấy thông báo:
   ```text
   ✅ [Redis] Đã kết nối thành công tới Redis server
   HRMSS API listening on port 5000
   ```
   *(Nhấn `Ctrl + C` để thoát màn hình xem log).*
3. **Mở cổng 5000 trên Firewall của Ubuntu (để bên ngoài gọi vào được):**
   ```bash
   sudo ufw allow 5000/tcp
   ```

---

### 🔹 Bước 7.9: Trải nghiệm & Kết nối App/Web
Bây giờ hệ thống của bạn đã chạy online trên toàn thế giới:
* Mở trình duyệt bất kỳ gõ:  
  👉 **`http://103.123.45.67:5000/api/health`**  
  Kết quả trả về: `{"status":"ok","service":"hrmss-api"}`!
* **Trên Mobile App của Khách hàng & Web:**  
  Trong file cấu hình API của App Mobile, bạn chỉ việc đổi:
  ```javascript
  const API_URL = 'http://103.123.45.67:5000/api';
  ```
  Giờ đây, thầy cô trong Hội đồng chấm thi ngồi ở giảng đường cầm điện thoại bấm đặt lịch hay xem đơn hàng là dữ liệu chạy thẳng lên VPS của bạn mượt mà 100%!

---
*Tài liệu được cập nhật tự động và lưu trữ tại `backend/HUONG_DAN_DOCKER_REDIS.md` phục vụ dự án tốt nghiệp SEP490-G81.*

