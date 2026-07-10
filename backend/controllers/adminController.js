const Worker = require('../models/Worker');
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const CallLead = require('../models/CallLead');
const AreaLaunchRequest = require('../models/AreaLaunchRequest');
const { createAuditLog } = require('../services/auditService');

exports.getStats = async (req, res) => {
    try {
        const totalWorkers = await Worker.countDocuments();
        const pendingWorkers = await Worker.countDocuments({ verificationStatus: 'Pending Verification' });
        const totalCustomers = await Customer.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const totalComplaints = await Complaint.countDocuments();
        const totalLeads = await CallLead.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                totalWorkers,
                pendingWorkers,
                totalCustomers,
                totalBookings,
                totalComplaints,
                totalLeads
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getPendingWorkers = async (req, res) => {
    try {
        const workers = await Worker.find({ verificationStatus: 'Pending Verification' });
        res.status(200).json({ success: true, count: workers.length, data: workers });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getAllWorkers = async (req, res) => {
    try {
        const workers = await Worker.find();
        res.status(200).json({ success: true, count: workers.length, data: workers });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json({ success: true, count: customers.length, data: customers });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('customerId', 'name phone').populate('workerId', 'name phone');
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getAllLeads = async (req, res) => {
    try {
        const leads = await CallLead.find();
        res.status(200).json({ success: true, count: leads.length, data: leads });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find().populate('customerId', 'name phone').populate('workerId', 'name phone');
        res.status(200).json({ success: true, count: complaints.length, data: complaints });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.verifyWorker = async (req, res) => {
    try {
        const { status, adminNote, phoneVerified, idVerified, areaVerified } = req.body;
        
        let updateData = {
            verificationStatus: status,
            verificationNotes: adminNote,
            phoneVerified,
            idVerified,
            areaVerified
        };

        if (status === 'Verified') {
            updateData.isVerified = true;
            updateData.trustScore = 75;
            updateData.verifiedAt = Date.now();
        } else if (status === 'Rejected') {
            updateData.isVerified = false;
        }

        const worker = await Worker.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!worker) {
            return res.status(404).json({ success: false, error: 'Worker not found' });
        }

        const { createNotification } = require('../services/notificationService');
        if (status === 'Verified') {
            createNotification({
                recipientId: worker._id, recipientRole: 'worker', type: 'worker_verified',
                title: 'Account Verified', message: 'Congratulations! Your account has been verified by the admin.', link: '/worker-dashboard'
            });
        } else if (status === 'Rejected') {
            createNotification({
                recipientId: worker._id, recipientRole: 'worker', type: 'worker_rejected',
                title: 'Verification Rejected', message: `Your verification was rejected. Reason: ${adminNote}`, link: '/worker-dashboard'
            });
        }
        
        await createAuditLog({
            actorId: req.user?._id,
            actorRole: 'admin',
            actorName: req.user?.name,
            action: status === 'Verified' ? 'WORKER_APPROVED' : 'WORKER_REJECTED',
            entityType: 'Worker',
            entityId: worker._id,
            description: `Worker ${worker.name} ${status.toLowerCase()} by admin.`,
            metadata: { note: adminNote },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: 'medium'
        });

        res.status(200).json({ success: true, data: worker });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.resolveComplaint = async (req, res) => {
    try {
        const { status, adminNote } = req.body;
        const updateData = { status, adminNote };
        if (status === 'Resolved') {
            updateData.resolvedAt = Date.now();
        }
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        const { createNotification } = require('../services/notificationService');
        if (complaint && complaint.customerId) {
            createNotification({
                recipientId: complaint.customerId, recipientRole: 'customer', type: 'complaint_updated',
                title: 'Complaint Updated', message: `Your complaint status is now ${status}.`, link: '/my-complaints'
            });
        }
        if (complaint && complaint.workerId) {
            createNotification({
                recipientId: complaint.workerId, recipientRole: 'worker', type: 'complaint_updated',
                title: 'Complaint Updated', message: `A complaint involving you is now ${status}.`, link: '/worker-dashboard'
            });
        }

        await createAuditLog({
            actorId: req.user?._id,
            actorRole: 'admin',
            actorName: req.user?.name,
            action: 'COMPLAINT_STATUS_UPDATED',
            entityType: 'Complaint',
            entityId: complaint._id,
            description: `Complaint updated to ${status} by admin.`,
            metadata: { note: adminNote },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: 'medium'
        });

        res.status(200).json({ success: true, data: complaint });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get matching performance analytics
// @route   GET /api/v1/admin/matching-analytics
// @access  Private/Admin
exports.getMatchingAnalytics = async (req, res) => {
    try {
        const workers = await Worker.find({ isBlocked: false, isAvailable: true });
        const { calculateWorkerScore } = require('../utils/workerRanking');
        
        // Calculate average score for workers based on a generic full-service search
        // This is a naive way for simple analytics
        const searchParams = {};
        const rankedWorkers = workers.map(w => {
            const { score, breakdown } = calculateWorkerScore(w, searchParams);
            return { worker: w, score, breakdown };
        }).sort((a, b) => b.score - a.score);

        const topWorkers = rankedWorkers.slice(0, 5).map(r => ({
            name: r.worker.name,
            phone: r.worker.phone,
            score: r.score
        }));
        const lowScoreWorkers = rankedWorkers.slice(-5).map(r => ({
            name: r.worker.name,
            phone: r.worker.phone,
            score: r.score
        }));

        // Fake some low supply areas / high demand services for now (can be computed from bookings vs workers in a real scenario)
        const lowSupplyAreas = ['Example Area 1'];
        const highDemandServices = ['Electrician'];
        const emergencyStats = {
            totalEmergencyWorkers: workers.filter(w => w.emergencyAvailable).length,
            successRate: '85%'
        };

        res.status(200).json({
            success: true,
            data: {
                topWorkers,
                lowScoreWorkers,
                lowSupplyAreas,
                highDemandServices,
                emergencyStats
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
