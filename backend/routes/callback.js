const express = require('express');
const router = express.Router();
const { createCallbackRequest, getCallbackRequests, updateCallbackStatus, assignWorkerToCallback } = require('../controllers/callbackController');

router.post('/', createCallbackRequest);
router.get('/', getCallbackRequests);
router.patch('/:id/status', updateCallbackStatus);
router.patch('/:id/assign-worker', assignWorkerToCallback);

module.exports = router;
