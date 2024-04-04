const axios = require("axios");
const dotenv = require("dotenv");
const logger = require('../utilities/logger');
const Redis = require("ioredis");
dotenv.config();

const redis = new Redis();
//const redis = new Redis({
//  maxRetriesPerRequest: null
//});

async function getAuthUser(token) {
    try {
      const cachedUser = await redis.get(token);
        if (cachedUser) {
          return JSON.parse(cachedUser);
        } else {
          const user = await axios.get(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
            headers: {
              Authorization: `Bearer ${token}`
      }
    })

    await redis.set(token, JSON.stringify(user.data), 'EX', 3600);

    return user.data;
  }
  } catch (error) {
    logger.info(`Error fetching user info: ${error}`, error.response ? error.response.data : error.message);
    throw error; 
  }
}

module.exports = getAuthUser;