FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY ./src/server.js ./server.js
COPY ./src/logger.js ./logger.js

EXPOSE 3000
CMD ["node", "server.js"]
