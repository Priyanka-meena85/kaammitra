const express = require('express');
const router = express.Router();
const { createRating, getWorkerRatings } = require('../controllers/ratingController');

router.post('/', createRating);
router.get('/worker/:workerId', getWorkerRatings);

module.exports = router;
