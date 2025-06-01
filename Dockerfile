FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.tsx" \) -exec dos2unix {} +

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]