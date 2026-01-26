FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY index.html config.js ./
EXPOSE 5173
CMD ["sh", "-c", "printf 'window.APP_CONFIG = {\\n  WS_URL: \"%s\"\\n};\\n' \"${WS_URL:-ws://localhost:8080}\" > config.js && npm run dev"]
