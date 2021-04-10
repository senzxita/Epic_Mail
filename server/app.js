/* eslint-disable import/no-dynamic-require */
import 'dotenv/config';
import '@babel/polyfill';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import routes from './routes/api';

const swaggerDocument = YAML.load(`${__dirname}/../swagger.yaml`);

const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(
  cors({
    origin: '*',
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

app.all('/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

const apiURL = '/api/v1';
global.apiURL = apiURL;

app.use('/', (req, res, next) => {
  if (req.originalUrl !== '/') {
    next();
    return;
  }
  /* istanbul ignore next */
  res.send({
    message: 'welcome to EPIC MAIL',
  });
});

Object.keys(routes).forEach((key) => {
  const value = routes[key];
  app.use(`${apiURL}/`, value);
});

/* istanbul ignore next */
app.use((req, res) => {
/* istanbul ignore next */
  res.status(404);
  /* istanbul ignore next */
  res.send({
    error: 'not found',
  });
});

if (!module.parent) {
/* istanbul ignore next */
  app.listen(process.env.PORT, () => {
  /* istanbul ignore next */
    console.log(`server start at port ${process.env.PORT} `);
  });
}

module.exports = app;
