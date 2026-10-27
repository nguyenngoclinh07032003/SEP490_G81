# ==============================================================================
# GIAI ĐOẠN 1: BUILD REACT + VITE (Node 20 Alpine)
# ==============================================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt toàn bộ dependencies (bao gồm Vite để build)
RUN npm install

# Copy toàn bộ mã nguồn frontend
COPY . .

# Biến môi trường API URL (mặc định trỏ về backend http://localhost:5000)
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

# Build dự án ra thư mục dist/
RUN npm run build

# ==============================================================================
# GIAI ĐOẠN 2: PRODUCTION WEB SERVER (Nginx Alpine siêu nhẹ ~20MB)
# ==============================================================================
FROM nginx:alpine

# Copy cấu hình Nginx hỗ trợ React Router SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy kết quả build từ giai đoạn 1 sang thư mục html của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Mở cổng 80 cho web server Nginx
EXPOSE 80

# Chạy Nginx ở chế độ foreground
CMD ["nginx", "-g", "daemon off;"]
