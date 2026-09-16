const express = require('express');
const { 
    createBooking, 
    getCustomerBookings, 
    getWorkerBookings, 
    updateBookingStatus, 
    suggestWorkers 
} = require('../controllers/bookingsController');
const { protect } = require('../middlewares/auth');
const { requireRole, requirePermission } = require('../middlewares/rbac');

const router = express.Router();

router.use(protect);

router.get('/suggest-workers', requirePermission('booking.create'), suggestWorkers);
router.post('/', requirePermission('booking.create'), createBooking);
router.get('/customer/:customerId', requireRole('customer', 'admin'), getCustomerBookings);
router.get('/worker/:workerId', requireRole('worker', 'admin'), getWorkerBookings);
router.patch('/:id/status', requirePermission('booking.status.update'), updateBookingStatus);

module.exports = router;
