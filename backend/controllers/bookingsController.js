const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const MatchEvent = require('../models/MatchEvent');
const Service = require('../models/Service');
const Worker = require('../models/Worker');
const { createAuditLog } = require('../services/auditService');
const { exactMatch } = require('../utils/escapeRegex');

const PUBLIC_WORKER_FIELDS = [
    'name', 'phone', 'whatsapp', 'services', 'skills', 'experience', 'expectedCharge',
    'city', 'area', 'radius', 'location', 'isAvailable', 'workingHoursStart',
    'workingHoursEnd', 'emergencyAvailable', 'preferredAreas', 'maxTravelDistance',
    'weeklyOffDay', 'verificationStatus', 'profilePhotoUrl', 'phoneVerified',
    'isVerified', 'trustScore', 'averageRating', 'totalReviews', 'ratingBreakdown',
    'badges', 'totalRatings', 'completedJobs', 'responseTime', 'profileCompletion',
    'role'
].join(' ');

// A worker's `services` array holds plain names ("Plumber"), not Service ids, so the
// booking form legitimately sends a name. Accept either and resolve to a real id.
const resolveServiceId = async (raw, fallbackName) => {
    if (mongoose.Types.ObjectId.isValid(raw)) return raw;

    const name = String(raw || fallbackName || '').trim();
    if (!name) return null;

    const service = await Service.findOne({
        $or: [{ name: exactMatch(name) }, { englishName: exactMatch(name) }]
    }).select('_id');

    return service ? service._id : null;
};

exports.createBooking = async (req, res) => {
    try {
        const { workerId, date, time } = req.body;

        if (!workerId) {
            return res.status(400).json({ success: false, message: 'Please choose a worker for this booking.' });
        }

        const worker = await Worker.findById(workerId).select('expectedCharge services isBlocked');
        if (!worker) {
            return res.status(404).json({ success: false, message: 'Worker not found.' });
        }
        if (worker.isBlocked) {
            return res.status(400).json({ success: false, message: 'This worker is no longer accepting bookings.' });
        }

        if (date) {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            if (Number.isNaN(new Date(date).getTime())) {
                return res.status(400).json({ success: false, message: 'Please choose a valid date.' });
            }
            if (new Date(date) < startOfToday) {
                return res.status(400).json({ success: false, message: 'Please choose today or a future date.' });
            }
        }

        const serviceId = await resolveServiceId(req.body.serviceId, req.body.service || worker.services?.[0]);
        if (!serviceId) {
            return res.status(400).json({
                success: false,
                message: 'We could not match that service. Please pick a service from the list and try again.'
            });
        }

        // Check for double booking if workerId and time are provided
        if (workerId && date && time) {
            const dateObj = new Date(date);
            // Ignore time portion for date matching if necessary, or just match exactly.
            // Since frontend sends date as YYYY-MM-DD, we can match the date at start of day
            const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
            const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

            const existingBooking = await Booking.findOne({
                workerId,
                date: { $gte: startOfDay, $lte: endOfDay },
                time,
                status: { $in: ['Pending', 'Accepted', 'On the Way', 'In Progress'] }
            });

            if (existingBooking) {
                return res.status(409).json({
                    success: false,
                    message: 'Worker is already booked for this time slot. Please choose another time.'
                });
            }
        }

        // Only these fields may come from the client. status, paymentStatus, advanceAmount
        // and the commission columns are server-owned; totalAmount is taken from the
        // worker's own rate so a customer cannot quote themselves a cheaper job.
        const booking = await Booking.create({
            customerId: req.user.id,
            workerId,
            serviceId,
            description: req.body.description,
            address: req.body.address,
            urgency: req.body.urgency,
            date,
            time,
            paymentMode: req.body.paymentMode,
            totalAmount: worker.expectedCharge || 500
        });

        // Emit live update via Socket.io and Notification
        const socketConfig = require('../socket');
        const io = socketConfig.getIo();
        const onlineUsers = socketConfig.getOnlineUsers();
        if (io && onlineUsers) {
            const targetSocketId = onlineUsers.get(String(booking.workerId));
            if (targetSocketId) {
                io.to(targetSocketId).emit('new_booking_received', { bookingId: booking._id, customerId: booking.customerId });
            }
        }

        const { createNotification } = require('../services/notificationService');
        createNotification({
            recipientId: booking.workerId,
            recipientRole: 'worker',
            type: 'booking_created',
            title: 'New Booking Request',
            message: 'You have a new booking request. Please check and respond.',
            link: '/worker-dashboard',
            io
        });
        createNotification({
            recipientId: booking.customerId,
            recipientRole: 'customer',
            type: 'booking_created',
            title: 'Booking Request Sent',
            message: 'Your booking request has been sent to the worker.',
            link: '/my-bookings',
            io
        });

        await createAuditLog({
            actorId: req.user.id,
            actorRole: req.user.role,
            actorName: req.user.name || 'Customer',
            action: 'BOOKING_CREATED',
            entityType: 'Booking',
            entityId: booking._id,
            description: `Booking request sent to worker ${booking.workerId}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: 'low'
        });

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
        
        if (req.user.role === 'customer') {
            if (String(booking.customerId) !== String(req.user.id)) {
                return res.status(403).json({ success: false, message: 'You can only update your own bookings' });
            }
            if (status !== 'Cancelled') {
                return res.status(403).json({ success: false, message: 'Not authorized to update status' });
            }
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
                
                await createAuditLog({
                    actorId: req.user.id,
                    actorRole: req.user.role,
                    actorName: req.user.name,
                    action: 'INVALID_BOOKING_STATUS_TRANSITION',
                    entityType: 'Booking',
                    entityId: booking._id,
                    description: `Attempted invalid transition from ${currentStatus} to ${status}`,
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                    severity: 'medium'
                });
                
                return res.status(400).json({ success: false, message: 'Invalid status transition' });
            }
        }

        booking.status = status;
        booking.statusUpdatedAt = new Date();
        await booking.save();

        // Update wallet on completion
        if (status === 'Completed' && booking.workerId) {
            const WorkerWallet = require('../models/WorkerWallet');
            const wallet = await WorkerWallet.findOne({ workerId: booking.workerId });
            if (wallet) {
                // Find all earnings for this booking in pending balance
                const pendingTransactions = wallet.transactions.filter(t => 
                    t.type === 'earning' && 
                    t.bookingId && 
                    t.bookingId.toString() === booking._id.toString()
                );
                
                let earningAmount = 0;
                for (const tx of pendingTransactions) {
                    earningAmount += tx.amount;
                }

                if (earningAmount > 0) {
                    wallet.pendingBalance -= earningAmount;
                    wallet.availableBalance += earningAmount;
                    wallet.totalEarnings += earningAmount;
                    // Note: We don't need a new transaction log for just moving from pending to available,
                    // but we could add one if desired. Earning was already logged.
                    await wallet.save();
                }
            }
        }

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

        const { createNotification } = require('../services/notificationService');
        let type, title, message;
        let notifyCustomer = false, notifyWorker = false;
        
        if (status === 'Accepted') {
            notifyCustomer = true; type = 'booking_accepted'; title = 'Booking Accepted'; message = 'Your booking request was accepted by the worker.';
        } else if (status === 'Rejected') {
            notifyCustomer = true; type = 'booking_rejected'; title = 'Booking Rejected'; message = 'Your booking request was rejected by the worker.';
        } else if (status === 'On the Way') {
            notifyCustomer = true; type = 'booking_on_the_way'; title = 'Worker on the way'; message = 'The worker is on the way to your location.';
        } else if (status === 'In Progress') {
            notifyCustomer = true; type = 'booking_in_progress'; title = 'Job In Progress'; message = 'Your job is now in progress.';
        } else if (status === 'Completed') {
            notifyCustomer = true; notifyWorker = true; type = 'booking_completed'; title = 'Job Completed'; message = 'Your job has been marked as completed.';
        } else if (status === 'Cancelled') {
            notifyWorker = true; type = 'booking_cancelled'; title = 'Booking Cancelled'; message = 'The customer has cancelled the booking.';
        }

        if (notifyCustomer) {
            createNotification({
                recipientId: booking.customerId, recipientRole: 'customer', type, title, message, link: '/my-bookings', io
            });
        }
        if (notifyWorker) {
            createNotification({
                recipientId: booking.workerId, recipientRole: 'worker', type, title, 
                message: status === 'Completed' ? 'Job marked as completed.' : message, 
                link: '/worker-dashboard', io
            });
        }
        
        await createAuditLog({
            actorId: req.user.id,
            actorRole: req.user.role,
            actorName: req.user.name,
            action: 'BOOKING_STATUS_UPDATED',
            entityType: 'Booking',
            entityId: booking._id,
            description: `Booking status updated to ${status}`,
            metadata: { prevStatus: currentStatus, newStatus: status },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: 'low'
        });

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
                { services: { $in: [exactMatch(service)] } },
                { skills: { $in: [exactMatch(service)] } }
            ];
        }
        if (city && city !== 'All Cities') query.city = exactMatch(city);
        if (area) query.area = exactMatch(area);
        if (urgency === 'emergency') query.emergencyAvailable = true;

        const workers = await Worker.find(query).select(PUBLIC_WORKER_FIELDS);
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
        
        // Log MatchEvent
        if (req.user) {
            MatchEvent.create({
                customerId: req.user.id,
                service: service || 'Any',
                city: city || 'Any',
                area: area || 'Any',
                urgency: urgency === 'emergency',
                resultsCount: suggested.length,
                topWorkerId: suggested.length > 0 ? suggested[0].worker._id : null,
                topScore: suggested.length > 0 ? suggested[0].matchScore : 0
            }).catch(e => console.error('MatchEvent Error:', e));
        }

        res.status(200).json({ success: true, count: suggested.length, data: suggested });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
