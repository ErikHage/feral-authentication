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

CMD ["nginx", "-g", "daemon off;"]
