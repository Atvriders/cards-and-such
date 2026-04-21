# syntax=docker/dockerfile:1.7
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY web/package.json ./web/
RUN npm ci --workspaces --include-workspace-root
COPY shared ./shared
COPY web ./web
RUN npm -w @cards/web run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/web/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
