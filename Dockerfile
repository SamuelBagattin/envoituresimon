FROM node:lts-alpine
WORKDIR /app/app
COPY . .
RUN npm ci
ENTRYPOINT ["node","index.js"]

