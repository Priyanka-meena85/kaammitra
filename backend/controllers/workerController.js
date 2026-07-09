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
