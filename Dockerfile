# syntax=docker/dockerfile:1

# Base image Bun (konsisten dengan bun.lock + script `bun run`).
FROM oven/bun:1-slim AS base
WORKDIR /app

# ---- deps: install semua dependency (termasuk devDeps utk tooling) ----
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- builder: bangun output standalone Next.js ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build tidak butuh secret (tak ada akses DB / NEXT_PUBLIC_* saat build).
RUN bun run build

# ---- tooling: image untuk migrate & seed one-off (punya source + drizzle-kit) ----
FROM base AS tooling
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["bun", "run", "db:migrate"]

# ---- runner: image produksi minimal ----
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder --chown=bun:bun /app/public ./public
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static

USER bun
EXPOSE 3000
# Standalone server.js dijalankan oleh Bun. Jika ada isu kompat runtime,
# ganti base runner ke `node:22-slim` + CMD ["node", "server.js"].
CMD ["bun", "server.js"]
