# مرحلة البناء
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# استخدام legacy-peer-deps في حال وجود تعارض بالحزم القديمة لـ CRA
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

COPY . .

# ضبط مسارات الـ API والـ WebSocket لتكون نسبية (نفس النطاق عبر Traefik)
ENV REACT_APP_API_BASE=/api
ENV REACT_APP_WS_BASE=/ws

# زيادة حد الذاكرة المتاحة لـ node أثناء البناء لتفادي كراش CRA
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run build

# مرحلة التشغيل الخفيفة عبر serve (بدون Nginx وسيط)
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/build ./build

EXPOSE 3000

# تشغيل SPA على المنفذ 3000
CMD ["serve", "-s", "build", "-l", "3000"]
