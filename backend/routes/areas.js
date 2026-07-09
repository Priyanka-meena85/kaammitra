const express = require('express');
const router = express.Router();
const { getAreas, createAreaLaunchRequest, getAreaLaunchRequests, updateAreaLaunchStatus } = require('../controllers/areasController');

router.get('/', getAreas);
router.post('/launch', createAreaLaunchRequest);
router.get('/launch', getAreaLaunchRequests);
router.patch('/launch/:id/status', updateAreaLaunchStatus);

module.exports = router;
