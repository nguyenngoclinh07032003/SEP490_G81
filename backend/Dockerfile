# Sử dụng Node.js 20 Alpine siêu nhẹ (khớp engines node >= 20)
FROM node:20-alpine

# Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# Copy file quản lý thư viện trước để tận dụng Docker layer cache
COPY package*.json ./

# Cài đặt dependencies cho môi trường chạy thực tế
RUN npm install --omit=dev

# Copy toàn bộ mã nguồn backend vào container
COPY . .

# Mở port 5000
EXPOSE 5000

# Khởi chạy server (node src/server.js)
CMD ["npm", "start"]

