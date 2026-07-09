const CallbackRequest = require('../models/CallbackRequest');

exports.createCallbackRequest = async (req, res) => {
    try {
        const request = await CallbackRequest.create(req.body);
        res.status(201).json({ success: true, data: request });
    } catch (err) {
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
