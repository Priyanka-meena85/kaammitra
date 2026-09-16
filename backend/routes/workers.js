const express = require('express');
const { 
    getWorkers, 
    getWorker, 
    updateAvailability, 
    updateWorkingHours, 
    verifyWorker, 
    blockWorker, 
    unblockWorker,
    smartMatchWorkers,
    emergencyMatchWorkers 
} = require('../controllers/workerController');
const cache = require('../middleware/cache');
const { protect } = require('../middlewares/auth');
const { requireRole, requirePermission } = require('../middlewares/rbac');

const router = express.Router();

// Cache smart-match for 60 seconds (since it changes often based on availability)
router.route('/smart-match').get(cache(60), smartMatchWorkers);
router.route('/emergency-match').get(emergencyMatchWorkers);

// Cache generic worker list for 5 minutes
router.route('/').get(cache(300), getWorkers);
router.route('/:id').get(getWorker);

router.patch('/:id/availability', protect, requirePermission('availability.manage.self'), updateAvailability);
router.patch('/:id/working-hours', protect, requirePermission('availability.manage.self'), updateWorkingHours);
router.patch('/:id/verify', protect, requirePermission('verification.manage'), verifyWorker);
router.patch('/:id/block', protect, requirePermission('workers.manage'), blockWorker);
router.patch('/:id/unblock', protect, requirePermission('workers.manage'), unblockWorker);

module.exports = router;
