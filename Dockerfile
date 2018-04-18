FROM node:8-alpine
WORKDIR /foo
COPY . .
RUN npm install
CMD ["node", "checkSum.js"]