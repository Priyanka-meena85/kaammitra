const express = require('express');
const { getServices, createService } = require('../controllers/servicesController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getServices);
router.post('/', protect, authorize('admin'), createService);

module.exports = router;
