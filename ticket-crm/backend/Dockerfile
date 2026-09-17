FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine

WORKDIR /app

# نسخ مخرجات البناء
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# تثبيت الحزم الإنتاجية
RUN npm ci --omit=dev

# نسخ الـ Prisma Client المولد من مرحلة البناء لضمان استقرار الاتصال بقاعدة البيانات
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

RUN mkdir -p uploads/avatars uploads/exports && \
    addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 4000
ENV NODE_ENV=production
ENV PORT=4000
ENV NEST_PORT=4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

# تشغيل التطبيق
CMD ["node", "dist/main"]
