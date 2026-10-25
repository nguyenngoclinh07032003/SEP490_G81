# Sử dụng Node.js 20 bản Alpine siêu nhẹ (~50MB)
FROM node:20-alpine

# Thư mục làm việc bên trong container
WORKDIR /app

# Copy package.json và package-lock.json của backend
COPY package*.json ./

# Cài đặt dependencies (bỏ qua devDependencies như nodemon trên production)
RUN npm install --omit=dev

# Copy toàn bộ mã nguồn backend vào container
COPY . .

# Mở cổng 5000 cho API Express
EXPOSE 5000

# Lệnh khởi động server
CMD ["node", "server.js"]
