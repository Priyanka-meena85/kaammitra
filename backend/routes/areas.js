const express = require('express');
const router = express.Router();
const { getAreas, createAreaLaunchRequest, getAreaLaunchRequests, updateAreaLaunchStatus } = require('../controllers/areasController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/', getAreas);
router.post('/launch', createAreaLaunchRequest);
router.get('/launch', protect, authorize('admin'), getAreaLaunchRequests);
router.patch('/launch/:id/status', protect, authorize('admin'), updateAreaLaunchStatus);

module.exports = router;
