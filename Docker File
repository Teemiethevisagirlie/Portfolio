# ╔═══════════════════════════════════════════════════════════════╗
# ║         TEEMIE THE VISA GIRLIE — Dockerfile                   ║
# ║  Single-file · Pure Node.js · Zero npm dependencies          ║
# ╚═══════════════════════════════════════════════════════════════╝

FROM node:20-alpine

# ── Metadata ────────────────────────────────────────────────────
LABEL maintainer="teemie@visagirlie.com"
LABEL description="Teemie The Visa Girlie — Personal Website & CMS"
LABEL version="1.0.0"

# ── Signal handling (proper PID 1 behaviour) ────────────────────
RUN apk add --no-cache dumb-init

# ── Working directory ───────────────────────────────────────────
WORKDIR /app

# ── Copy the single server file (NO package.json needed) ────────
COPY server.js .

# ── Persistent data directory (mount a volume here) ─────────────
RUN mkdir -p /data && chown -R node:node /data /app

# ── Drop to non-root user ────────────────────────────────────────
USER node

# ── Environment variables ────────────────────────────────────────
ENV PORT=3000
ENV NODE_ENV=production
ENV DATA_FILE=/data/site-data.json

# ⚠️  Change JWT_SECRET in production!
# docker run -e JWT_SECRET=your-random-secret-here ...
ENV JWT_SECRET=teemie-visa-girlie-change-in-production

# ── Port ────────────────────────────────────────────────────────
EXPOSE 3000

# ── Health check ─────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/content > /dev/null || exit 1

# ── Start ────────────────────────────────────────────────────────
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
