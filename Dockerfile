FROM node:lts-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

# Install exactly what package-lock.json names, as npm ci does locally
RUN npm ci

COPY . .

RUN npm run build

# production stage
FROM nginx:stable-alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html/auth

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# Reports whether nginx is serving the app; it restarts nothing by itself.
# The app lives under /auth/, so that's the path that answers 200
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
    CMD wget -q --spider http://127.0.0.1/auth/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
