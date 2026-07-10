const EmergencyLead = require('../models/EmergencyLead');
const { createAuditLog } = require('../services/auditService');

exports.createEmergencyLead = async (req, res) => {
    try {
        const lead = await EmergencyLead.create(req.body);

        const { createNotification } = require('../services/notificationService');
        const Admin = require('../models/Admin');
        const admin = await Admin.findOne();
        if (admin) {
            createNotification({
                recipientId: admin._id, recipientRole: 'admin', type: 'emergency_request',
                priority: 'urgent', title: 'New Emergency Lead', message: 'An emergency service was requested!', link: '/admin-dashboard'
            });
        }
        
        await createAuditLog({
            actorId: null,
            actorRole: 'customer',
            actorName: lead.customerName || 'Unknown Customer',
            action: 'EMERGENCY_LEAD_CREATED',
            entityType: 'EmergencyLead',
            entityId: lead._id,
            description: `Emergency lead created for service: ${lead.serviceRequired}`,
            metadata: { phone: lead.customerPhone },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: 'high'
        });

        res.status(201).json({ success: true, data: lead });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getEmergencyLeads = async (req, res) => {
    try {
        const leads = await EmergencyLead.find().populate('assignedWorkerId', 'name phone');
        res.status(200).json({ success: true, data: leads });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateEmergencyLeadStatus = async (req, res) => {
    try {
        const lead = await EmergencyLead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        
        await createAuditLog({
            actorId: req.user ? req.user.id : null,
            actorRole: req.user ? req.user.role : 'system',
            actorName: req.user ? req.user.name : 'System',
            action: 'EMERGENCY_LEAD_STATUS_UPDATED',
            entityType: 'EmergencyLead',
            entityId: lead._id,
            description: `Emergency lead status updated to ${req.body.status}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: 'medium'
        });
        
        res.status(200).json({ success: true, data: lead });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.assignWorkerToEmergencyLead = async (req, res) => {
    try {
        const lead = await EmergencyLead.findByIdAndUpdate(req.params.id, { assignedWorkerId: req.body.workerId, status: 'Worker Assigned' }, { new: true });
        
        const { createNotification } = require('../services/notificationService');
        createNotification({
            recipientId: req.body.workerId, recipientRole: 'worker', type: 'emergency_request',
            priority: 'urgent', title: 'Emergency Assignment', message: 'You have been assigned to an emergency request!', link: '/worker-dashboard'
        });

        await createAuditLog({
            actorId: req.user ? req.user.id : null,
            actorRole: 'admin',
            actorName: req.user ? req.user.name : 'System',
            action: 'EMERGENCY_LEAD_ASSIGNED',
            entityType: 'EmergencyLead',
            entityId: lead._id,
            description: `Emergency lead assigned to worker ${req.body.workerId}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: 'high'
        });

        res.status(200).json({ success: true, data: lead });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
