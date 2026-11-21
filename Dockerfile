# syntax=docker/dockerfile:1

# @feral-auth/vue-components is a private npm package, so npm ci needs a token.
# It comes in as a build secret, mounted only while npm ci runs, so it is in no
# layer of the image:
#
#   docker build --secret id=npmrc,src=$HOME/.npmrc -t ehage/feral-authentication-app .
#
# where that .npmrc holds `//registry.npmjs.org/:_authToken=<a read-only token>`.

FROM node:lts-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

# Install exactly what package-lock.json names, as npm ci does locally
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc,required=true npm ci

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
