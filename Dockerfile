FROM node:24-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm test

EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
