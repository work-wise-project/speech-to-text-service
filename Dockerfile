# Base image
FROM node:22.11.0-slim

WORKDIR /speech-to-text-service

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "dev"]
