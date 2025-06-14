FROM node:14.15.1 AS frontend-build

WORKDIR /app

COPY ./public ./public
COPY ./src ./src
COPY ./package*.json ./

RUN npm install --silent
RUN npm run build --production --silent

FROM node:14.15.1-alpine

WORKDIR /var/www

COPY ./server.js ./
COPY ./package*.json ./
RUN npm install --production --silent && npm cache clean --force

COPY --from=frontend-build /app/build ./public

CMD ["node", "server.js"]
