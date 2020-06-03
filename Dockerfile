FROM node:14-alpine
WORKDIR /home/comparisons
COPY package.json package.json
RUN npm i
WORKDIR /home/comparisons/suites
COPY . .
