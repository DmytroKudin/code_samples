const express = require('express');
const router = express.Router();
const sitesController = require('../controllers/site');

router.get('/', sitesController.getSitesData);

module.exports = router;