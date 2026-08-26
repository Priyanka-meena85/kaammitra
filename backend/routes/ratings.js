const express = require('express');
const router = express.Router();
const { createRating, getWorkerRatings } = require('../controllers/ratingController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', protect, authorize('customer'), createRating);
router.get('/worker/:workerId', getWorkerRatings);

module.exports = router;
