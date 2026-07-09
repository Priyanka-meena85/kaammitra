const Worker = require('../models/Worker');
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const CallLead = require('../models/CallLead');
const AreaLaunchRequest = require('../models/AreaLaunchRequest');

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
        res.status(200).json({ success: true, data: complaint });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
