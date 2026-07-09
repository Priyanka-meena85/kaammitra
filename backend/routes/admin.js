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
    resolveComplaint
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/workers/pending', getPendingWorkers);
router.get('/workers', getAllWorkers);
router.get('/customers', getAllCustomers);
router.get('/bookings', getAllBookings);
router.get('/leads', getAllLeads);
router.get('/complaints', getAllComplaints);
router.patch('/workers/:id/verify', verifyWorker);
router.patch('/complaints/:id/resolve', resolveComplaint);

module.exports = router;
