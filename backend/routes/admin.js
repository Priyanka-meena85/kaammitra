const express = require('express');
const { getStats, getPendingWorkers, verifyWorker } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/workers/pending', getPendingWorkers);
router.patch('/workers/:id/verify', verifyWorker);

module.exports = router;
