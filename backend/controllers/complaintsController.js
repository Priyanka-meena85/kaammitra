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
        const complaints = await Complaint.find().populate('worker', 'name phone').populate('booking');
        res.status(200).json({ success: true, count: complaints.length, data: complaints });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
