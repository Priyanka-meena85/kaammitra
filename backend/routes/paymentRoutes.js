const express = require('express');
const router = express.Router();
const {
    createOrder,
    verifyPayment,
    getBookingPayments,
    getMyPayments,
    getWorkerWallet,
    requestPayout,
    getAdminPayouts,
    updatePayoutStatus,
    createSubscription,
    verifySubscription
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middlewares/auth');

// Customer Routes
router.post('/create-order', protect, authorize('customer'), createOrder);
router.post('/verify', protect, authorize('customer'), verifyPayment);
router.get('/my', protect, authorize('customer'), getMyPayments);

// Worker Routes
router.get('/wallet', protect, authorize('worker'), getWorkerWallet);
router.post('/payout-request', protect, authorize('worker'), requestPayout);

// Admin Routes
router.get('/admin/payouts', protect, authorize('admin'), getAdminPayouts);
router.patch('/admin/payouts/:id', protect, authorize('admin'), updatePayoutStatus);

// Shared Routes
router.post('/subscription/create', protect, createSubscription);
router.post('/subscription/verify', protect, verifySubscription);
router.get('/booking/:bookingId', protect, getBookingPayments);

module.exports = router;
