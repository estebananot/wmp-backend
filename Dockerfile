FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

COPY package*.json ./
RUN npm ci --only=production && npm prune --production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
