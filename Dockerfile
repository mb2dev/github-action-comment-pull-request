FROM node:10

COPY . .

RUN npm install --production

ENTRYPOINT ["node", "/lib/main.js"]