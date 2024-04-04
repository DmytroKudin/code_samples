const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/download');

router.get('/', downloadController.downloadFile);

module.exports = router;