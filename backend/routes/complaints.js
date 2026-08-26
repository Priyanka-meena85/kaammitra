const express = require('express');
const { createComplaint, getComplaints, getMyComplaints } = require('../controllers/complaintsController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/', protect, authorize('customer'), createComplaint);
router.get('/', protect, authorize('admin'), getComplaints);
router.get('/my', protect, getMyComplaints);

module.exports = router;
