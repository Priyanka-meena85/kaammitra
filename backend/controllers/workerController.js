const Worker = require('../models/Worker');

// @desc    Get all workers (with optional geolocation filtering)
// @route   GET /api/v1/workers
// @access  Public
exports.getWorkers = async (req, res) => {
    try {
        const { service, lng, lat, distance } = req.query;
        let query = { isVerified: true, availability: true };

        if (service) {
            query.services = { $in: [service] };
        }

        if (lng && lat && distance) {
            // Earth radius in km is 6378.1
            const radius = distance / 6378.1;
            query.location = {
                $geoWithin: {
                    $centerSphere: [[lng, lat], radius]
                }
            };
        }

        const workers = await Worker.find(query);
        res.status(200).json({ success: true, count: workers.length, data: workers });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single worker
// @route   GET /api/v1/workers/:id
// @access  Public
exports.getWorker = async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id);
        if (!worker) {
            return res.status(404).json({ success: false, error: 'Worker not found' });
        }
        res.status(200).json({ success: true, data: worker });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update worker availability
// @route   PATCH /api/v1/workers/:id/availability
// @access  Private/Worker
exports.updateAvailability = async (req, res) => {
    try {
        const { isAvailable } = req.body;
        const worker = await Worker.findByIdAndUpdate(req.params.id, { isAvailable }, { new: true });
        res.status(200).json({ success: true, data: worker });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update working hours
// @route   PATCH /api/v1/workers/:id/working-hours
// @access  Private/Worker
exports.updateWorkingHours = async (req, res) => {
    try {
        const { workingHoursStart, workingHoursEnd, emergencyAvailable, weeklyOffDay } = req.body;
        const worker = await Worker.findByIdAndUpdate(req.params.id, { 
            workingHoursStart, workingHoursEnd, emergencyAvailable, weeklyOffDay 
        }, { new: true });
        res.status(200).json({ success: true, data: worker });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Verify worker (Admin)
// @route   PATCH /api/v1/workers/:id/verify
// @access  Private/Admin
exports.verifyWorker = async (req, res) => {
    try {
        const { verificationStatus, phoneVerified, idVerified, areaVerified, verificationNotes } = req.body;
        const worker = await Worker.findByIdAndUpdate(req.params.id, {
            verificationStatus, phoneVerified, idVerified, areaVerified, verificationNotes,
            isVerified: verificationStatus === 'Verified'
        }, { new: true });
        res.status(200).json({ success: true, data: worker });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Block worker (Admin)
// @route   PATCH /api/v1/workers/:id/block
// @access  Private/Admin
exports.blockWorker = async (req, res) => {
    try {
        const worker = await Worker.findByIdAndUpdate(req.params.id, { isBlocked: true, verificationStatus: 'Blocked' }, { new: true });
        res.status(200).json({ success: true, data: worker });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Unblock worker (Admin)
// @route   PATCH /api/v1/workers/:id/unblock
// @access  Private/Admin
exports.unblockWorker = async (req, res) => {
    try {
        const worker = await Worker.findByIdAndUpdate(req.params.id, { isBlocked: false, verificationStatus: 'Active' }, { new: true });
        res.status(200).json({ success: true, data: worker });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
