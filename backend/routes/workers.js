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

const router = express.Router();

router.route('/smart-match').get(smartMatchWorkers);
router.route('/emergency-match').get(emergencyMatchWorkers);

router.route('/').get(getWorkers);
router.route('/:id').get(getWorker);

router.patch('/:id/availability', updateAvailability);
router.patch('/:id/working-hours', updateWorkingHours);
router.patch('/:id/verify', verifyWorker);
router.patch('/:id/block', blockWorker);
router.patch('/:id/unblock', unblockWorker);

module.exports = router;
