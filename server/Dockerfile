FROM node:15

WORKDIR /usr/src/app

COPY ./server .

COPY ./package.json .

COPY ./.babelrc .

RUN npm install

RUN npm run build

CMD [ "node", "dist/app.js" ]

