const express = require('express');
const { 
    getStats, 
    getPendingWorkers, 
    getAllWorkers,
    getAllCustomers,
    getAllBookings,
    getAllLeads,
    getAllComplaints,
    verifyWorker,
    resolveComplaint,
    getMatchingAnalytics,
    createAdmin
} = require('../controllers/adminController');
const { protect } = require('../middlewares/auth');
const { requireRole, requirePermission } = require('../middlewares/rbac');

const router = express.Router();

router.use(protect);
router.use(requireRole('admin'));

router.get('/stats', requirePermission('analytics.read'), getStats);
router.get('/matching-analytics', requirePermission('analytics.read'), getMatchingAnalytics);
router.get('/workers/pending', requirePermission('workers.manage'), getPendingWorkers);
router.get('/workers', requirePermission('workers.manage'), getAllWorkers);
router.get('/customers', requirePermission('users.manage'), getAllCustomers);
router.get('/bookings', requirePermission('bookings.read'), getAllBookings);
router.get('/leads', requirePermission('users.read'), getAllLeads);
router.get('/complaints', requirePermission('safety.manage'), getAllComplaints);
router.patch('/workers/:id/verify', requirePermission('verification.manage'), verifyWorker);
router.patch('/complaints/:id/resolve', requirePermission('safety.manage'), resolveComplaint);
router.post('/admins', requireRole('admin'), createAdmin); // Only admins can create admins

module.exports = router;
