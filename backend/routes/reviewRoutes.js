const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, authorize } = require('../middlewares/auth');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const Customer = require('../models/Customer');
const { calculateWorkerTrustScore } = require('../utils/trustScore');
const { calculateCustomerReliability } = require('../utils/customerReliability');
const { evaluateWorkerBadges } = require('../utils/badgeService');
const { evaluateUserRisk } = require('../services/fraudDetectionService');
const { createAuditLog } = require('../services/auditService');

// Create Review
router.post('/', protect, async (req, res) => {
    try {
        const { bookingId, rating, title, comment, tags, photos } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Valid rating (1-5) is required' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.status !== 'Completed') {
            return res.status(400).json({ success: false, message: 'Review only allowed after booking is completed' });
        }

        let reviewerRole = req.user.role;
        let targetRole = reviewerRole === 'customer' ? 'worker' : 'customer';
        let targetId = reviewerRole === 'customer' ? booking.workerId : booking.customerId;

        // Verify reviewer is part of booking
        if (reviewerRole === 'customer' && booking.customerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to review this booking' });
        }
        if (reviewerRole === 'worker' && booking.workerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to review this booking' });
        }

        // Check duplicate
        const existingReview = await Review.findOne({ bookingId, reviewerId: req.user.id });
        if (existingReview) {
            return res.status(409).json({ success: false, message: 'You have already reviewed this booking' });
        }

        // Check spam/suspicious words (mock simple check)
        const suspiciousWords = ['fake', 'scam', 'fraud'];
        let status = 'visible';
        if (comment && suspiciousWords.some(w => comment.toLowerCase().includes(w))) {
            status = 'pending_moderation';
        }

        const review = await Review.create({
            bookingId,
            customerId: booking.customerId,
            workerId: booking.workerId,
            reviewerId: req.user.id,
            reviewerRole,
            targetId,
            targetRole,
            rating,
            title,
            comment,
            tags,
            photos,
            status
        });

        // Update Target Stats
        if (targetRole === 'worker') {
            const worker = await Worker.findById(targetId);
            if (worker) {
                // Update average rating
                const allReviews = await Review.find({ targetId, status: 'visible' });
                worker.totalReviews = allReviews.length;
                worker.averageRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / worker.totalReviews;
                
                if (!worker.ratingBreakdown) worker.ratingBreakdown = { five: 0, four: 0, three: 0, two: 0, one: 0 };
                const map = { 5: 'five', 4: 'four', 3: 'three', 2: 'two', 1: 'one' };
                worker.ratingBreakdown[map[rating]] += 1;

                // Re-evaluate trust
                const { trustScore, riskLevel } = calculateWorkerTrustScore(worker);
                worker.trustScore = trustScore;
                if (worker.riskLevel !== 'critical') worker.riskLevel = riskLevel;
                
                // Evaluate risk
                const riskEval = evaluateUserRisk(worker, 'worker');
                if (riskEval.riskLevel !== 'low' && worker.riskLevel !== 'critical') {
                    worker.riskLevel = riskEval.riskLevel;
                    worker.isFlagged = riskEval.flags.length > 0;
                    worker.flagReasons = [...new Set([...worker.flagReasons || [], ...riskEval.flags])];
                }

                // Evaluate badges
                worker.badges = evaluateWorkerBadges(worker);
                await worker.save();
            }
        } else if (targetRole === 'customer') {
            const customer = await Customer.findById(targetId);
            if (customer) {
                // Not storing rating directly, but can re-calc reliability
                const { reliabilityScore, riskLevel } = calculateCustomerReliability(customer);
                customer.reliabilityScore = reliabilityScore;
                if (customer.riskLevel !== 'critical') customer.riskLevel = riskLevel;
                await customer.save();
            }
        }

        // Audit Log
        createAuditLog({
            actorId: req.user.id,
            actorRole: req.user.role,
            actorName: req.user.name,
            action: 'REVIEW_CREATED',
            entityType: 'Review',
            entityId: review._id,
            description: `Review created for booking ${bookingId} by ${req.user.role}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: 'low'
        });

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Get Worker Reviews (Public)
router.get('/worker/:workerId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const query = { targetId: req.params.workerId, targetRole: 'worker', status: 'visible' };
        if (req.query.rating) query.rating = req.query.rating;
        if (req.query.tags) query.tags = { $in: req.query.tags.split(',') };

        const reviews = await Review.find(query)
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('reviewerId', 'name profilePhotoUrl'); // safe fields

        const total = await Review.countDocuments(query);

        res.json({ success: true, data: { reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Report Review
router.patch('/:id/report', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

        review.reportedCount += 1;
        if (review.reportedCount >= 3 && review.status === 'visible') {
            review.status = 'pending_moderation';
        }
        await review.save();

        res.json({ success: true, message: 'Review reported' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Admin: Get all reviews
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.rating) query.rating = req.query.rating;
        if (req.query.workerId) query.workerId = req.query.workerId;
        if (req.query.reported === 'true') query.reportedCount = { $gte: 1 };

        const reviews = await Review.find(query)
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('reviewerId', 'name')
            .populate('workerId', 'name');

        const total = await Review.countDocuments(query);
        res.json({ success: true, data: { reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Admin: Moderate review
router.patch('/admin/:id/moderate', protect, authorize('admin'), async (req, res) => {
    try {
        const { status, moderationNote } = req.body;
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

        review.status = status;
        if (moderationNote) review.moderationNote = moderationNote;
        review.moderatedBy = req.user.id;
        review.moderatedAt = new Date();
        
        await review.save();

        createAuditLog({
            actorId: req.user.id,
            actorRole: 'admin',
            actorName: req.user.name,
            action: 'REVIEW_MODERATED',
            entityType: 'Review',
            entityId: review._id,
            description: `Admin moderated review ${review._id} to status ${status}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: 'medium'
        });

        res.json({ success: true, data: review });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = router;
