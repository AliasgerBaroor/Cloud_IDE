FROM node:18

WORKDIR /user-container

COPY package.json ./

RUN npm install

COPY . .

ENTRYPOINT ["node", "index.js"]
