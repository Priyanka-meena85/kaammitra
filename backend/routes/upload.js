const express = require('express');
const router = express.Router();
const { uploadDocument } = require('../controllers/uploadController');
const { publicWriteLimiter } = require('../middlewares/rateLimit');

router.post('/', publicWriteLimiter, uploadDocument);

module.exports = router;
