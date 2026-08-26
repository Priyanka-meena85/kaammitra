const express = require('express');
const { createLead, getLeads, updateLeadStatus } = require('../controllers/leadsController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/', createLead);
router.get('/', protect, authorize('admin', 'worker'), getLeads);
router.patch('/:id/status', protect, authorize('worker', 'admin'), updateLeadStatus);

module.exports = router;
