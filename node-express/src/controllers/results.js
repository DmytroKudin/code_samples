const { Doc, Request } = require('../models');
const path = require('path');
const logger = require('../utilities/logger.js');

async function uploadResultsFile(req, res) {
    try {
        const { requestId, clean } = req.body;
        const file = req.file;

        if (!file) {
            logger.warn('No file provided');
            return res.status(400).send("File is required.");
        }

        if (!requestId) {
            logger.warn('No requestId provided');
            return res.status(400).send("requestId is required.");
        }

        const request = await Request.findByPk(requestId);
        if (!request) {
            logger.warn('Request not found');
            return res.status(404).send("Request not found.");
        }

        const filePath = file.path; 
        const fileExtension = path.extname(file.originalname);

        logger.info('File saved to server', { filePath, fileExtension });

        const doc = await Doc.create({
            type: 'Results',
            request_id: requestId,
            url: filePath,
            extension: fileExtension,
            stage: 'Results',
            profile_id: request.profile_id
        });

        logger.info('Document created in database', { docId: doc.id_docs });

        if (clean) {
            request.cleanurl = filePath;
        } else {
            request.answerurl = filePath;
        }

        await request.save();

        logger.info('Request updated in database', { requestId: request.id_request });

        res.json({ message: 'File uploaded and data saved successfully!' });
    } catch (err) {
        logger.error('Error handling file upload request', { error: err });
        console.error(err);
        res.status(500).send("Error " + err);
    }
}

module.exports = { uploadResultsFile };
