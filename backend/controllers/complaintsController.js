const Complaint = require('../models/Complaint');
const Booking = require('../models/Booking');
const { createAuditLog } = require('../services/auditService');

exports.createComplaint = async (req, res) => {
    try {
        const { bookingId, reason, description } = req.body;

        // A complaint damages a worker's trust score, so it must be tied to a real
        // booking that belongs to the complaining customer.
        const booking = await Booking.findOne({ _id: bookingId, customerId: req.user.id }).select('workerId');
        if (!booking) {
            return res.status(403).json({
                success: false,
                message: 'You can only raise a complaint about your own booking.'
            });
        }

        const complaint = await Complaint.create({
            customerId: req.user.id,
            workerId: booking.workerId,
            bookingId,
            reason,
            description
        });

        const { createNotification } = require('../services/notificationService');
        const Admin = require('../models/Admin');
        const admin = await Admin.findOne();
        if (admin) {
            createNotification({
                recipientId: admin._id, recipientRole: 'admin', type: 'complaint_created',
                title: 'New Complaint', message: 'A new complaint has been filed.', link: '/admin-dashboard'
            });
        }

        await createAuditLog({
            actorId: req.user ? req.user.id : null,
            actorRole: req.user ? req.user.role : 'system',
            actorName: req.user ? req.user.name : 'Unknown',
            action: 'COMPLAINT_CREATED',
            entityType: 'Complaint',
            entityId: complaint._id,
            description: `Complaint created: ${complaint.complaintType}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: 'low'
        });

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
