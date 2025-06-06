FROM node:22

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=4096" 

COPY package.json package-lock.json ./
RUN npm ci

RUN npx playwright install --with-deps

COPY . .

RUN npx prettier --write . || true

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]