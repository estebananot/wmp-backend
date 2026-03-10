FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN npm ci --only=production && npm cache clean --force

# Install ts-node for seeds
RUN npm install -g ts-node typescript

EXPOSE 3000

CMD ["node", "dist/main.js"]
