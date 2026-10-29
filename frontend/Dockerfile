# ==============================================================================
# STAGE 1: BUILD REACT / VITE APPLICATION
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy mã nguồn frontend
COPY . .

# Nhận biến môi trường VITE_API_URL lúc build (mặc định trỏ về cổng 5000 của Backend)
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

# Build ra thư mục tĩnh /app/dist
RUN npm run build

# ==============================================================================
# STAGE 2: SERVE PRODUCTION BUILD VỚI NGINX ALPINE
# ==============================================================================
FROM nginx:alpine

# Copy cấu hình Nginx hỗ trợ React Router (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy toàn bộ file tĩnh đã build từ Stage 1 sang Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Mở cổng 80 bên trong container
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

