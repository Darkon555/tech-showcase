FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4002
CMD ["npm", "start"]
