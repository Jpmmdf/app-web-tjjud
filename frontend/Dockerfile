FROM node:24-alpine AS build
ARG APP_VERSION=0.0.0-local
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm version --no-git-tag-version "$APP_VERSION" && npm run build

FROM nginx:1.29-alpine
ARG APP_VERSION=0.0.0-local
LABEL org.opencontainers.image.version=$APP_VERSION

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
