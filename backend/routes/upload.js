const express = require('express');
const router = express.Router();
const { uploadDocument } = require('../controllers/uploadController');
const { protect } = require('../middlewares/auth');

router.post('/', protect, uploadDocument);

module.exports = router;
