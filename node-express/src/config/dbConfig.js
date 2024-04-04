const fs = require('fs');
const logger = require('../utilities/logger');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
};

logger.info('dbConfig Configuration has been called successfully', { host: dbConfig.host });

module.exports = dbConfig;
