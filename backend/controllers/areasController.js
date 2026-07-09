const Area = require('../models/Area');
const AreaLaunchRequest = require('../models/AreaLaunchRequest');

exports.getAreas = async (req, res) => {
    try {
        const areas = await Area.find();
        res.status(200).json({ success: true, data: areas });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createAreaLaunchRequest = async (req, res) => {
    try {
        const request = await AreaLaunchRequest.create(req.body);
        res.status(201).json({ success: true, data: request });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAreaLaunchRequests = async (req, res) => {
    try {
        const requests = await AreaLaunchRequest.find();
        res.status(200).json({ success: true, data: requests });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateAreaLaunchStatus = async (req, res) => {
    try {
        const request = await AreaLaunchRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.status(200).json({ success: true, data: request });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
