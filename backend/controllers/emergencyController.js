const EmergencyLead = require('../models/EmergencyLead');

exports.createEmergencyLead = async (req, res) => {
    try {
        const lead = await EmergencyLead.create(req.body);
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
        res.status(200).json({ success: true, data: lead });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.assignWorkerToEmergencyLead = async (req, res) => {
    try {
        const lead = await EmergencyLead.findByIdAndUpdate(req.params.id, { assignedWorkerId: req.body.workerId, status: 'Worker Assigned' }, { new: true });
        res.status(200).json({ success: true, data: lead });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
