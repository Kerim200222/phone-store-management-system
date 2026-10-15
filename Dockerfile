# syntax=docker/dockerfile:1

# 1. Base image
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 2. Dependencies stage (Sadece package.json ve lock dosyalarını yükleme)
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# 3. Builder stage (Statik ve standalone derleme alma)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables ve telemetry kapatma
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

ARG NEXT_PUBLIC_SUPABASE_URL=https://sample-project.supabase.co
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy-build-key
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# 4. Runner stage (Ultra hafif Alpine/Node imajı - standalone output)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Güvenlik: Uygulama root kullanıcısı yerine izole nextjs kullanıcısıyla çalışır
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Statik varlıkları ve standalone derleme çıktılarını kopyalama
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
