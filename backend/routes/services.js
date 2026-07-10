const express = require('express');
const { getServices, createService } = require('../controllers/servicesController');
const { protect, authorize } = require('../middlewares/auth');
const cache = require('../middleware/cache');

const router = express.Router();

router.get('/', cache(3600), getServices);
router.post('/', protect, authorize('admin'), createService);

module.exports = router;
