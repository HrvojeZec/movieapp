# syntax=docker/dockerfile:1

# Production image based on Next.js standalone output.
# Secrets are not baked in: pass them at runtime (see compose.yaml / .env.example).

FROM node:26-alpine AS base
# libc6-compat is needed by some native Node modules on Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# --- Install dependencies (cached unless the lockfile or npm config changes) ---
FROM base AS deps
COPY package.json package-lock.json .npmrc ./
# HUSKY=0: git hooks are for development and there is no .git directory in the build context
RUN HUSKY=0 npm ci

# --- Build the app ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN NEXT_OUTPUT_STANDALONE=true npm run build

# --- Minimal runtime image ---
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Healthy when the app answers and reaches MongoDB (/api/health). Node's fetch, since the Alpine
# image has no curl; the start period covers the first database connection.
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD ["node", "-e", "fetch(`http://localhost:${process.env.PORT}/api/health`).then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]

CMD ["node", "server.js"]
