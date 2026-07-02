FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY entrypoint.sh ./
RUN mkdir -p uploads && chown -R nestjs:nodejs uploads
RUN apk --no-cache add curl postgresql-client
RUN chmod +x entrypoint.sh
USER nestjs
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD curl -f http://localhost:4000/api/health || exit 1
ENTRYPOINT ["./entrypoint.sh"]
