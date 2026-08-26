# ── Stage 1: Dependencies & Build ──────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY nextjs/package*.json ./
RUN npm ci

# Copy source and build Next.js standalone application
COPY nextjs/ ./
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# ── Stage 2: AppSail Runtime ───────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy built standalone server & assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
