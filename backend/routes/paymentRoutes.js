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
const { protect } = require('../middlewares/auth');
const { requireRole, requirePermission } = require('../middlewares/rbac');

// Customer Routes
router.post('/create-order', protect, requirePermission('payment.create'), createOrder);
router.post('/verify', protect, requirePermission('payment.create'), verifyPayment);
router.get('/my', protect, requirePermission('payment.read.own'), getMyPayments);

// Worker Routes
router.get('/wallet', protect, requirePermission('wallet.read.self'), getWorkerWallet);
router.post('/payout-request', protect, requirePermission('withdrawal.create.self'), requestPayout);

// Admin Routes
router.get('/admin/payouts', protect, requirePermission('refunds.manage'), getAdminPayouts);
router.patch('/admin/payouts/:id', protect, requirePermission('refunds.manage'), updatePayoutStatus);

// Shared Routes
router.post('/subscription/create', protect, createSubscription);
router.post('/subscription/verify', protect, verifySubscription);
router.get('/booking/:bookingId', protect, getBookingPayments);

module.exports = router;
