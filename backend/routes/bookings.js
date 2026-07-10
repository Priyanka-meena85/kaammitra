const express = require('express');
const { 
    createBooking, 
    getCustomerBookings, 
    getWorkerBookings, 
    updateBookingStatus, 
    suggestWorkers 
} = require('../controllers/bookingsController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/suggest-workers', authorize('customer'), suggestWorkers);
router.post('/', authorize('customer'), createBooking);
router.get('/customer/:customerId', authorize('customer', 'admin'), getCustomerBookings);
router.get('/worker/:workerId', authorize('worker', 'admin'), getWorkerBookings);
router.patch('/:id/status', authorize('customer', 'worker', 'admin'), updateBookingStatus);

module.exports = router;
