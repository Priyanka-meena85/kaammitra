const express = require('express');
const { createLead, getLeads } = require('../controllers/leadsController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/', createLead);
router.get('/', protect, authorize('admin'), getLeads);

module.exports = router;
