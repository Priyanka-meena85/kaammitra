const express = require('express');
const router = express.Router();
const { createEmergencyLead, getEmergencyLeads, updateEmergencyLeadStatus, assignWorkerToEmergencyLead } = require('../controllers/emergencyController');

router.post('/', createEmergencyLead);
router.get('/', getEmergencyLeads);
router.patch('/:id/status', updateEmergencyLeadStatus);
router.patch('/:id/assign-worker', assignWorkerToEmergencyLead);

module.exports = router;
