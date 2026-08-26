const express = require('express');
const router = express.Router();
const { createEmergencyLead, getEmergencyLeads, updateEmergencyLeadStatus, assignWorkerToEmergencyLead } = require('../controllers/emergencyController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', createEmergencyLead);
router.get('/', protect, authorize('admin'), getEmergencyLeads);
router.patch('/:id/status', protect, authorize('admin'), updateEmergencyLeadStatus);
router.patch('/:id/assign-worker', protect, authorize('admin'), assignWorkerToEmergencyLead);

module.exports = router;
