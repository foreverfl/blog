FROM node:24

WORKDIR /app

RUN ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime \
    && echo "Asia/Seoul" > /etc/timezone
    
ENV NODE_OPTIONS="--max-old-space-size=4096" 

COPY package.json package-lock.json ./

RUN npm ci

RUN npx playwright install --with-deps

COPY . .

RUN npx prettier --write . || true

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]