FROM node:18


WORKDIR /app

COPY package*.json ./

RUN npm install && npm install typescript -g


COPY . .

RUN tsc

EXPOSE 5002

CMD ["node", "dist/app.js"]
