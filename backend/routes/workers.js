const express = require('express');
const { getWorkers, getWorker, updateAvailability, updateWorkingHours, verifyWorker, blockWorker, unblockWorker } = require('../controllers/workerController');

const router = express.Router();

router.route('/').get(getWorkers);
router.route('/:id').get(getWorker);

router.patch('/:id/availability', updateAvailability);
router.patch('/:id/working-hours', updateWorkingHours);
router.patch('/:id/verify', verifyWorker);
router.patch('/:id/block', blockWorker);
router.patch('/:id/unblock', unblockWorker);

module.exports = router;
