FROM node:24-bookworm-slim AS frontend-build

WORKDIR /frontend

COPY SynthAIPro/package*.json ./
RUN npm ci

COPY SynthAIPro/ ./
RUN npm run build

FROM node:24-bookworm-slim

ENV NODE_ENV=production
ENV NODE_MODE=full
ENV PORT=10000
ENV FRONTEND_DIST=/app/frontend-dist
ENV TRIDENT_ONNX_ENABLED=false

WORKDIR /app

COPY Synthia-server/package*.json ./
RUN npm ci --omit=dev

COPY Synthia-server/ ./
COPY --from=frontend-build /frontend/dist ./frontend-dist

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:10000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "run", "start:full"]
