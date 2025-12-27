FROM node:latest

WORKDIR /app

COPY server.js ./
COPY package*.json ./

RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]