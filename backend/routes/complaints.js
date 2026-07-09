const express = require('express');
const { createComplaint, getComplaints } = require('../controllers/complaintsController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// protect only if creating a complaint requires auth, but sometimes anyone can
router.post('/', createComplaint); 
router.get('/', protect, authorize('admin'), getComplaints);

module.exports = router;
