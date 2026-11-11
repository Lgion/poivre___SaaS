FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/
COPY shared-assets/ ./shared-assets/
COPY start-ecosystem.js ./

RUN npm install --production --no-audit --no-fund

EXPOSE 3001 3002 3003

CMD ["node", "start-ecosystem.js"]

