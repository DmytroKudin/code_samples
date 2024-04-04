const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/results'); 
const { upload } = require('../utilities/multer');

router.post('/', upload.single('file'), resultsController.uploadResultsFile);

module.exports = router;