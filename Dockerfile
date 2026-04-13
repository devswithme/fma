# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_APP_ID=""
ENV VITE_APP_ID=${VITE_APP_ID}
RUN pnpm build && pnpm prune --prod

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
COPY --from=build --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=appuser:nodejs /app/dist ./dist
COPY --from=build --chown=appuser:nodejs /app/package.json ./package.json
COPY --from=build --chown=appuser:nodejs /app/drizzle ./drizzle
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ > /dev/null || exit 1
CMD ["node", "dist/index.js"]
