FROM node:8-alpine
WORKDIR /Ethan_Solution
COPY . .
RUN npm install
CMD ["node", "checkSum.js"]