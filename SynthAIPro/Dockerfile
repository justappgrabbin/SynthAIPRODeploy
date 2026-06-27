FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_SYNTHIA_API_URL=
ARG VITE_SYNTHIA_WS_URL=
ENV VITE_SYNTHIA_API_URL=$VITE_SYNTHIA_API_URL
ENV VITE_SYNTHIA_WS_URL=$VITE_SYNTHIA_WS_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=10000

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/dist ./dist

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:10000/health >/dev/null || exit 1

CMD ["node", "server.js"]
