const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const { calculateWorkerScore } = require('../utils/workerRanking');
const { createAuditLog } = require('../services/auditService');

// @desc    Get all workers (with optional geolocation filtering & smart ranking)
// @route   GET /api/v1/workers
// @access  Public
exports.getWorkers = async (req, res) => {
    try {
        const { service, lng, lat, distance, city, area, smart, urgency, maxBudget, preferredTime, customerId } = req.query;
        let query = { isBlocked: false };

        if (service) {
            query.$or = [
                { services: { $in: [new RegExp(`^${service}$`, 'i')] } },
                { skills: { $in: [new RegExp(`^${service}$`, 'i')] } }
            ];
        }
        if (city && city !== 'All Cities') {
            query.city = new RegExp(`^${city}$`, 'i');
        }
        if (area) {
            query.area = new RegExp(`^${area}$`, 'i');
        }

        if (lng && lat && distance) {
            const radius = distance / 6378.1;
            query.location = {
                $geoWithin: {
                    $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius]
                }
            };
        }

        const workers = await Worker.find(query);

        if (smart === 'true') {
            const searchParams = { service, city, area, latitude: lat, longitude: lng, urgency, maxBudget, preferredTime };
            
            // Phase 9: Collaborative Filtering
            if (customerId) {
                const pastBookings = await Booking.find({ customerId, status: 'Completed' }).select('workerId');
                searchParams.pastBookedWorkers = pastBookings.map(b => b.workerId?.toString()).filter(Boolean);
            }

            const rankedWorkers = workers.map(w => {
                const { score, breakdown, matchReason } = calculateWorkerScore(w, searchParams);
                // Return plain object to attach new properties safely
                return {
                    worker: w,
                    matchScore: score,
                    matchBreakdown: breakdown,
                    matchReason
                };
            }).sort((a, b) => b.matchScore - a.matchScore);

            return res.status(200).json({ success: true, count: rankedWorkers.length, data: rankedWorkers });
        }

        res.status(200).json({ success: true, count: workers.length, data: workers });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get workers via explicit smart match API
// @route   GET /api/v1/workers/smart-match
// @access  Public
exports.smartMatchWorkers = async (req, res) => {
    try {
        const { service, city, area, latitude, longitude, urgency, maxBudget, preferredTime, limit, customerId } = req.query;
        let query = { isBlocked: false };

        if (service) {
            query.$or = [
                { services: { $in: [new RegExp(`^${service}$`, 'i')] } },
                { skills: { $in: [new RegExp(`^${service}$`, 'i')] } }
            ];
        }
        if (city && city !== 'All Cities') query.city = new RegExp(`^${city}$`, 'i');
        if (area) query.area = new RegExp(`^${area}$`, 'i');

        const workers = await Worker.find(query);
        const searchParams = { service, city, area, latitude, longitude, urgency, maxBudget, preferredTime };
        
        // Phase 9: Collaborative Filtering
        if (customerId) {
            const pastBookings = await Booking.find({ customerId, status: 'Completed' }).select('workerId');
            searchParams.pastBookedWorkers = pastBookings.map(b => b.workerId?.toString()).filter(Boolean);
        }

        let rankedWorkers = workers.map(w => {
            const { score, breakdown, matchReason } = calculateWorkerScore(w, searchParams);
            return { worker: w, matchScore: score, matchBreakdown: breakdown, matchReason };
        }).sort((a, b) => b.matchScore - a.matchScore);

        if (limit) {
            rankedWorkers = rankedWorkers.slice(0, parseInt(limit));
        }

        res.status(200).json({ success: true, count: rankedWorkers.length, data: rankedWorkers });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get emergency match workers
// @route   GET /api/v1/workers/emergency-match
// @access  Public
exports.emergencyMatchWorkers = async (req, res) => {
    try {
        const { service, city, area, latitude, longitude } = req.query;
        let query = { isBlocked: false, emergencyAvailable: true, isAvailable: true };

        const workers = await Worker.find(query);
        const searchParams = { service, city, area, latitude, longitude, urgency: 'emergency' };
        
        let rankedWorkers = workers.map(w => {
            const { score, breakdown, matchReason } = calculateWorkerScore(w, searchParams);
            return { worker: w, matchScore: score, matchBreakdown: breakdown, matchReason };
        }).sort((a, b) => b.matchScore - a.matchScore);

        const topWorkers = rankedWorkers.slice(0, 5);

        if (topWorkers.length === 0) {
            return res.status(200).json({ success: true, data: [], message: 'No emergency worker available right now. We will notify admin.' });
        }

        res.status(200).json({ success: true, count: topWorkers.length, data: topWorkers });
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
        
        await createAuditLog({
            actorId: req.user.id,
            actorRole: 'worker',
            actorName: req.user.name,
            action: 'WORKER_AVAILABILITY_UPDATED',
            entityType: 'Worker',
            entityId: worker._id,
            description: `Worker updated availability to ${isAvailable}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: 'low'
        });

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
        
        await createAuditLog({
            actorId: req.user.id,
            actorRole: 'admin',
            actorName: req.user.name,
            action: 'WORKER_BLOCKED',
            entityType: 'Worker',
            entityId: worker._id,
            description: `Worker blocked by admin`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: 'high'
        });

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
        
        await createAuditLog({
            actorId: req.user.id,
            actorRole: 'admin',
            actorName: req.user.name,
            action: 'WORKER_UNBLOCKED',
            entityType: 'Worker',
            entityId: worker._id,
            description: `Worker unblocked by admin`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: 'high'
        });

        res.status(200).json({ success: true, data: worker });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
