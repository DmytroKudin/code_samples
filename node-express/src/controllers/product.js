const { Profile, Product} = require('../models');
const logger = require('../utilities/logger.js');
const {uniq} = require("lodash");
const getAuthUser = require("../utilities/getAuthUser");

async function getProducts(req, res) {
  const user = await getAuthUser(req.auth.token);
  const clientName = user.profile;

  try {
    const profile = await Profile.findOne({ where: { profilename: clientName } });
    if (!profile) {
      return res.status(404).send("Profile not found.");
    }
    const products = await Product.findAll({
      where: {
        profile_id: profile.id_profile
      },
      attributes: [
        'name'
      ],
      order: [['name', 'ASC']]
    })

    return res.json(uniq(products.map(product => product.name)));
  } catch (error) {
    logger.error('Error getting client data', { clientName, error });
    return res.status(500).send('Internal server error.');
  }
};

module.exports = { getProducts };
