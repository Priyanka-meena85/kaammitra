const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
    try {
        req.body.customerId = req.user.id;
        
        // Check for double booking if workerId and time are provided
        if (req.body.workerId && req.body.date && req.body.time) {
            const dateObj = new Date(req.body.date);
            // Ignore time portion for date matching if necessary, or just match exactly.
            // Since frontend sends date as YYYY-MM-DD, we can match the date at start of day
            const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
            const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
            
            const existingBooking = await Booking.findOne({
                workerId: req.body.workerId,
                date: { $gte: startOfDay, $lte: endOfDay },
                time: req.body.time,
                status: { $in: ['Pending', 'Accepted', 'On the Way', 'In Progress'] }
            });

            if (existingBooking) {
                return res.status(409).json({
                    success: false,
                    message: 'Worker is already booked for this time slot. Please choose another time.'
                });
            }
        }

        const booking = await Booking.create(req.body);

        // Emit live update via Socket.io
        const socketConfig = require('../socket');
        const io = socketConfig.getIo();
        const onlineUsers = socketConfig.getOnlineUsers();
        if (io && onlineUsers) {
            const targetSocketId = onlineUsers.get(String(booking.workerId));
            if (targetSocketId) {
                io.to(targetSocketId).emit('new_booking_received', { bookingId: booking._id, customerId: booking.customerId });
            }
        }

        res.status(201).json({ success: true, data: booking });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getCustomerBookings = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && String(req.user.id) !== String(req.params.customerId)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const bookings = await Booking.find({ customerId: req.params.customerId }).populate('workerId', 'name phone averageRating');
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getWorkerBookings = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && String(req.user.id) !== String(req.params.workerId)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const bookings = await Booking.find({ workerId: req.params.workerId }).populate('customerId', 'name phone address');
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatuses = ['Pending', 'Accepted', 'On the Way', 'In Progress', 'Completed', 'Cancelled', 'Rejected', 'Rated'];
        
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid booking status' });
        }

        let booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        if (req.user.role === 'customer' && status !== 'Cancelled') {
            return res.status(403).json({ success: false, message: 'Not authorized to update status' });
        }

        if (req.user.role === 'worker' && String(booking.workerId) !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: 'You can only update your own bookings' });
        }

        // State machine validation
        const currentStatus = booking.status;
        const validTransitions = {
            'Pending': ['Accepted', 'Rejected', 'Cancelled'],
            'Accepted': ['On the Way', 'Cancelled'],
            'On the Way': ['In Progress', 'Cancelled'],
            'In Progress': ['Completed'],
            'Completed': [],
            'Cancelled': [],
            'Rejected': [],
            'Rated': []
        };

        if (req.user.role !== 'admin' || true) { // Enforce state machine for admin as well per requirements
            if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status transition' });
            }
        }

        booking.status = status;
        booking.statusUpdatedAt = new Date();
        await booking.save();

        // Emit live update via Socket.io
        const socketConfig = require('../socket');
        const io = socketConfig.getIo();
        const onlineUsers = socketConfig.getOnlineUsers();
        if (io && onlineUsers) {
            // If worker updates status, notify customer
            if (req.user.role === 'worker' || req.user.role === 'admin') {
                const targetSocketId = onlineUsers.get(String(booking.customerId));
                if (targetSocketId) {
                    io.to(targetSocketId).emit('booking_status_updated', { bookingId: booking._id, status });
                }
            }
            // If customer cancels, notify worker
            if (req.user.role === 'customer' && status === 'Cancelled') {
                const targetSocketId = onlineUsers.get(String(booking.workerId));
                if (targetSocketId) {
                    io.to(targetSocketId).emit('booking_status_updated', { bookingId: booking._id, status });
                }
            }
        }

        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Suggest workers for booking
// @route   GET /api/v1/bookings/suggest-workers
// @access  Public
exports.suggestWorkers = async (req, res) => {
    try {
        const { service, city, area, preferredDate, preferredTime, urgency, maxBudget } = req.query;
        
        let query = { isBlocked: false, isAvailable: true };
        if (service) {
            query.$or = [
                { services: { $in: [new RegExp(`^${service}$`, 'i')] } },
                { skills: { $in: [new RegExp(`^${service}$`, 'i')] } }
            ];
        }
        if (city && city !== 'All Cities') query.city = new RegExp(`^${city}$`, 'i');
        if (area) query.area = new RegExp(`^${area}$`, 'i');
        if (urgency === 'emergency') query.emergencyAvailable = true;

        const workers = await require('../models/Worker').find(query);
        const searchParams = { service, city, area, preferredTime, urgency, maxBudget };
        const { calculateWorkerScore } = require('../utils/workerRanking');
        
        // Also check if they are already double-booked (simplified check)
        const dateObj = preferredDate ? new Date(preferredDate) : null;
        let startOfDay, endOfDay;
        if (dateObj) {
            startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
            endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
        }

        let rankedWorkers = [];
        for (const w of workers) {
            // Check double booking if date & time are provided
            if (dateObj && preferredTime) {
                const existingBooking = await Booking.findOne({
                    workerId: w._id,
                    date: { $gte: startOfDay, $lte: endOfDay },
                    time: preferredTime,
                    status: { $in: ['Pending', 'Accepted', 'On the Way', 'In Progress'] }
                });
                if (existingBooking) continue; // Skip booked worker
            }

            const { score, breakdown, matchReason } = calculateWorkerScore(w, searchParams);
            rankedWorkers.push({ worker: w, matchScore: score, matchBreakdown: breakdown, matchReason });
        }

        rankedWorkers.sort((a, b) => b.matchScore - a.matchScore);
        const suggested = rankedWorkers.slice(0, 5); // Return top 5

        res.status(200).json({ success: true, count: suggested.length, data: suggested });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
