const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const CallLead = require('../models/CallLead');

exports.getStats = async (req, res) => {
    try {
        const totalWorkers = await Worker.countDocuments();
        const pendingWorkers = await Worker.countDocuments({ isVerified: false });
        const totalBookings = await Booking.countDocuments();
        const totalComplaints = await Complaint.countDocuments();
        const totalLeads = await CallLead.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                totalWorkers,
                pendingWorkers,
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
        const workers = await Worker.find({ isVerified: false });
        res.status(200).json({ success: true, count: workers.length, data: workers });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.verifyWorker = async (req, res) => {
    try {
        const worker = await Worker.findByIdAndUpdate(
            req.params.id,
            { isVerified: true, trustScore: 75 },
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
