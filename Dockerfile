FROM node:lts-alpine
WORKDIR /app
COPY . .
RUN npm ci
ENTRYPOINT ["node","index.js"]

