const { Category} = require('../models');
const logger = require('../utilities/logger.js');
const isSupportUser = require("../utilities/isSupportUser");

async function getCategories(req, res) {
  try {
    const isSupport = await isSupportUser(req.auth.token);
    if (isSupport) {
      const categories = await Category.findAll();

      return res.json(categories);
    } else {
      return res.json("You don't have access");
    }
  } catch (err) {
    console.error(err);
    logger.error(`Error in getCategories ${err}`, { error: err });
  }
}

module.exports = { getCategories };
