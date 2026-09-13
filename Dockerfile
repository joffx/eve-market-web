# ===== Stage 1: Builder =====
# Compila la app Next.js (standalone) para Dokploy / GHCR
FROM node:24.14.0-alpine3.23 AS builder

WORKDIR /app

RUN corepack enable

# Manifiestos primero (cache de capas)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# Clave AES (base64, 32 bytes) para IDs estables de Server Actions entre builds/réplicas.
# Generar: openssl rand -base64 32
ARG NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=

# Identificador del deploy (p. ej. GITHUB_SHA). Activa skew protection de Server Actions.
ARG NEXT_DEPLOYMENT_ID=

ENV NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY \
    NEXT_DEPLOYMENT_ID=$NEXT_DEPLOYMENT_ID \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max-old-space-size=2048

RUN if [ -z "$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY" ]; then \
      echo "WARNING: NEXT_SERVER_ACTIONS_ENCRYPTION_KEY vacío — cada build regenerará IDs de Server Actions."; \
    fi \
 && pnpm run build

# Workaround Next 16 + pnpm: el standalone no traza ESM de @swc/helpers
RUN HELPERS_SRC="$(find /app/node_modules/.pnpm -type d -path '*/node_modules/@swc/helpers' | head -1)" \
  && test -n "$HELPERS_SRC" \
  && test -f "$HELPERS_SRC/esm/_interop_require_default.js" \
  && echo "Patching @swc/helpers from $HELPERS_SRC" \
  && find /app/.next/standalone -type d -path '*/node_modules/@swc/helpers' | while IFS= read -r dest; do \
       cp -a "$HELPERS_SRC/." "$dest/"; \
       test -f "$dest/esm/_interop_require_default.js"; \
       echo "patched $dest"; \
     done \
  && if ! find /app/.next/standalone -type f -path '*/@swc/helpers/esm/_interop_require_default.js' | grep -q .; then \
       NEXT_NM="$(find /app/.next/standalone -type d -path '*/.pnpm/next@*/node_modules' | head -1)"; \
       test -n "$NEXT_NM"; \
       mkdir -p "$NEXT_NM/@swc"; \
       cp -a "$HELPERS_SRC" "$NEXT_NM/@swc/helpers"; \
       test -f "$NEXT_NM/@swc/helpers/esm/_interop_require_default.js"; \
       echo "injected into $NEXT_NM/@swc/helpers"; \
     fi

# ===== Stage 2: Runner (ligero) =====
FROM node:24.14.0-alpine3.23 AS runner

ENV NODE_ENV=production \
    TZ=America/Guayaquil \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max-old-space-size=512 \
    UV_THREADPOOL_SIZE=4 \
    MALLOC_ARENA_MAX=2

RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

WORKDIR /app

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

RUN test -f /app/server.js || \
    (echo "Build failed: standalone server.js not found" && exit 1) && \
    mkdir -p /app/.next/cache /app/.next/server && \
    chown -R node:node /app/.next

USER node

EXPOSE 3000

CMD ["node", "--max-old-space-size=512", "server.js"]
