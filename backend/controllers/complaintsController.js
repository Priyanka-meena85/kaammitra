const Complaint = require('../models/Complaint');

exports.createComplaint = async (req, res) => {
    try {
        req.body.customer = req.user ? req.user.id : undefined; // Optional customer ID if logged in
        const complaint = await Complaint.create(req.body);
        res.status(201).json({ success: true, data: complaint });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: complaints.length, data: complaints });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getMyComplaints = async (req, res) => {
    try {
        const query = req.user.role === 'customer' ? { customerId: req.user.id } : { workerId: req.user.id };
        const complaints = await Complaint.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: complaints.length, data: complaints });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
