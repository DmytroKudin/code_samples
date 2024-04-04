const path = require('path');
const logger = require('../utilities/logger.js');


function downloadFile(req, res) {
  const filepath = req.query.filepath;

  logger.info('Received request to download file', { filepath }); 

  if (!filepath) {
    logger.warn('Filepath parameter is missing'); 
    return res.status(400).send("Filepath parameter is required.");
  }
  const absolutePath = path.resolve(process.cwd(), filepath);
  res.download(absolutePath, (err) => {
    if (err) {
      logger.error('Error downloading the file', { err }); 
      console.error(err);
      res.status(500).send("Error downloading the file.");
    } else {
      logger.info('File downloaded successfully', { absolutePath });
    }
  });
}

module.exports = { downloadFile };