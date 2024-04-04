const { Sequelize } = require('sequelize');
const dbConfig = require('./dbConfig');  
const logger = require('../utilities/logger.js');
const dotenv = require("dotenv");
dotenv.config();

logger.info('Loading Sequelize configuration...');

const {
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  DB_HOST,
  DB_PORT,

  LOGS_DB_USERNAME,
  LOGS_DB_PASSWORD,
  LOGS_DB_NAME,
  LOGS_DB_HOST,
  LOGS_DB_PORT,

  NOTIFICATIONS_DB_USERNAME,
  NOTIFICATIONS_DB_PASSWORD,
  NOTIFICATIONS_DB_NAME,
  NOTIFICATIONS_DB_HOST,
  NOTIFICATIONS_DB_PORT,
} = process.env;


const main = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'postgres',
  logging: (msg) => logger.info(msg),
  port: DB_PORT,
  dialectOptions: {
    ssl: dbConfig.ssl,
  },
});

const log = new Sequelize(LOGS_DB_NAME, LOGS_DB_USERNAME, LOGS_DB_PASSWORD, {
  host: LOGS_DB_HOST,
  dialect: 'postgres',
  logging: (msg) => logger.info(msg),
  port: LOGS_DB_PORT,
  dialectOptions: {
    ssl: dbConfig.ssl,
  },
});

const notification = new Sequelize(NOTIFICATIONS_DB_NAME, NOTIFICATIONS_DB_USERNAME, NOTIFICATIONS_DB_PASSWORD, {
  host: NOTIFICATIONS_DB_HOST,
  dialect: 'postgres',
  logging: (msg) => logger.info(msg),
  port: NOTIFICATIONS_DB_PORT,
  dialectOptions: {
    ssl: dbConfig.ssl,
  },
});

Promise.all([
  main.authenticate(),
  log.authenticate(),
  notification.authenticate(),
])
  .then(() => {
    logger.info('Sequelize configuration loaded successfully.');
  })
  .catch((error) => {
    logger.error('Failed to load Sequelize configuration.', { error });
  });

module.exports = { main, log, notification };