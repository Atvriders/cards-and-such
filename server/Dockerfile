# syntax=docker/dockerfile:1.7
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY web/package.json ./web/
RUN npm ci --workspaces --include-workspace-root

FROM deps AS build
COPY shared ./shared
COPY server ./server
RUN npm -w @cards/server run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=4000 DB_PATH=/data/cards.db
RUN mkdir -p /data
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/shared ./shared
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/package.json ./package.json
EXPOSE 4000
CMD ["node", "server/dist/index.js"]
