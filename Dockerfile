# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://localhost:3002/api
ENV NEXT_PUBLIC_AUTH_API_URL=http://localhost:3002/api/auth
ENV NEXT_PUBLIC_PRODUCT_API_URL=http://localhost:3002/api/products
ENV NEXT_PUBLIC_CHAT_API_URL=http://localhost:3002/api/chat
ENV NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
ENV NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_IMAGE_BASE_URL=https://res.cloudinary.com/dls9re0ux/image/upload
RUN npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
