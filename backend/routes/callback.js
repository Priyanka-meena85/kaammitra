const express = require('express');
const router = express.Router();
const { createCallbackRequest, getCallbackRequests, updateCallbackStatus, assignWorkerToCallback } = require('../controllers/callbackController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', createCallbackRequest);
router.get('/', protect, authorize('admin'), getCallbackRequests);
router.patch('/:id/status', protect, authorize('admin'), updateCallbackStatus);
router.patch('/:id/assign-worker', protect, authorize('admin'), assignWorkerToCallback);

module.exports = router;
