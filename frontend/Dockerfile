FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir src

EXPOSE 3000
CMD ["npm", "start"]
