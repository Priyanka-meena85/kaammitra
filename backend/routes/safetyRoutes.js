const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const SafetyReport = require('../models/SafetyReport');
const Worker = require('../models/Worker');
const Customer = require('../models/Customer');
const { createAuditLog } = require('../services/auditService');

// Create Safety Report
router.post('/report', protect, async (req, res) => {
    try {
        const { targetId, targetRole, bookingId, type, severity, description, evidence } = req.body;
        
        const report = await SafetyReport.create({
            reporterId: req.user.id,
            reporterRole: req.user.role,
            targetId,
            targetRole,
            bookingId,
            type,
            severity: severity || 'medium',
            description,
            evidence
        });

        // Flag Target if severity is high/critical
        if (severity === 'high' || severity === 'critical') {
            if (targetRole === 'worker') {
                await Worker.findByIdAndUpdate(targetId, { 
                    isFlagged: true,
                    riskLevel: severity === 'critical' ? 'critical' : 'high',
                    $addToSet: { flagReasons: type }
                });
            } else if (targetRole === 'customer') {
                await Customer.findByIdAndUpdate(targetId, {
                    isFlagged: true,
                    riskLevel: severity === 'critical' ? 'critical' : 'high',
                    $addToSet: { flagReasons: type }
                });
            }
        }

        createAuditLog({
            actorId: req.user.id,
            actorRole: req.user.role,
            actorName: req.user.name,
            action: 'SAFETY_REPORT_CREATED',
            entityType: 'SafetyReport',
            entityId: report._id,
            description: `Safety report of type ${type} filed against ${targetRole}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: severity === 'critical' ? 'high' : 'medium'
        });

        res.status(201).json({ success: true, data: report });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Get My Reports
router.get('/my-reports', protect, async (req, res) => {
    try {
        const reports = await SafetyReport.find({ reporterId: req.user.id }).sort('-createdAt');
        res.json({ success: true, data: { reports } });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Admin: Get all reports
router.get('/admin/reports', protect, authorize('admin'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.severity) query.severity = req.query.severity;
        if (req.query.targetRole) query.targetRole = req.query.targetRole;
        if (req.query.type) query.type = req.query.type;

        const reports = await SafetyReport.find(query)
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await SafetyReport.countDocuments(query);
        res.json({ success: true, data: { reports, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Admin: Resolve report
router.patch('/admin/reports/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const { status, adminNote, actionTaken } = req.body;
        const report = await SafetyReport.findById(req.params.id);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        report.status = status;
        if (adminNote) report.adminNote = adminNote;
        if (actionTaken) report.actionTaken = actionTaken;
        
        if (status === 'resolved' || status === 'rejected') {
            report.resolvedAt = new Date();
            report.resolvedBy = req.user.id;
        }

        await report.save();

        createAuditLog({
            actorId: req.user.id,
            actorRole: 'admin',
            actorName: req.user.name,
            action: 'SAFETY_REPORT_RESOLVED',
            entityType: 'SafetyReport',
            entityId: report._id,
            description: `Admin updated safety report ${report._id} status to ${status}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: 'medium'
        });

        res.json({ success: true, data: report });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = router;
