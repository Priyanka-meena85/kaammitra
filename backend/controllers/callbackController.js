const CallbackRequest = require('../models/CallbackRequest');

exports.createCallbackRequest = async (req, res) => {
    try {
        // Public endpoint: accept only the fields a visitor is allowed to set, so
        // nobody can self-assign a worker or pre-set the status.
        const { name, phone, service, city, area, preferredCallTime, note } = req.body;
        const request = await CallbackRequest.create({ name, phone, service, city, area, preferredCallTime, note });
        res.status(201).json({ success: true, data: request });
    } catch (err) {
        // Surface validation problems (missing name/phone/service) instead of a blanket 500.
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error('createCallbackRequest error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getCallbackRequests = async (req, res) => {
    try {
        const requests = await CallbackRequest.find().populate('assignedWorkerId', 'name phone');
        res.status(200).json({ success: true, data: requests });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateCallbackStatus = async (req, res) => {
    try {
        const request = await CallbackRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.status(200).json({ success: true, data: request });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.assignWorkerToCallback = async (req, res) => {
    try {
        const request = await CallbackRequest.findByIdAndUpdate(req.params.id, { assignedWorkerId: req.body.workerId, status: 'Worker Assigned' }, { new: true });
        res.status(200).json({ success: true, data: request });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
