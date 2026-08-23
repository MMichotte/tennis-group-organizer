FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY ./public ./public
COPY ./src ./src
COPY ./index.html ./
COPY ./vite.config.ts ./tsconfig.json ./
COPY ./package*.json ./

RUN npm ci --silent
RUN npm run build --silent

FROM node:22-alpine

WORKDIR /var/www

COPY ./server.js ./
COPY ./package*.json ./
RUN npm ci --omit=dev --silent && npm cache clean --force

COPY --from=frontend-build /app/dist ./public

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
