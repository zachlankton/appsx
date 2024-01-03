FROM node:20

WORKDIR /app

COPY . .
RUN rm .env*

RUN npm ci
RUN npm run build:ts

CMD ["node", "server.js"]