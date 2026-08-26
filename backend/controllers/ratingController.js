const mongoose = require('mongoose');
const Rating = require('../models/Rating');
const Worker = require('../models/Worker');
const Booking = require('../models/Booking');

// Recompute from the collection rather than nudging a running average. The old
// incremental formula drifted and produced NaN whenever averageRating was unset.
const refreshWorkerRatingStats = async (workerId) => {
    const [stats] = await Rating.aggregate([
        { $match: { workerId: new mongoose.Types.ObjectId(String(workerId)) } },
        { $group: { _id: '$workerId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    await Worker.findByIdAndUpdate(workerId, {
        averageRating: stats ? Math.round(stats.avg * 10) / 10 : 0,
        totalRatings: stats ? stats.count : 0
    });
};

exports.createRating = async (req, res) => {
    try {
        const { workerId, bookingId, tags } = req.body;
        const rating = Number(req.body.rating);
        // The rating modal posts `review`; the schema field is `comment`.
        const comment = req.body.comment ?? req.body.review;

        if (!workerId || !mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({ success: false, message: 'A valid worker is required.' });
        }
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Please give a rating between 1 and 5 stars.' });
        }

        // Only a customer who actually completed a job with this worker may rate them.
        const eligible = { customerId: req.user.id, workerId, status: { $in: ['Completed', 'Rated'] } };
        if (bookingId) {
            if (!mongoose.Types.ObjectId.isValid(bookingId)) {
                return res.status(400).json({ success: false, message: 'Invalid booking reference.' });
            }
            eligible._id = bookingId;
        }

        const booking = await Booking.findOne(eligible).sort({ updatedAt: -1 }).select('_id');
        if (!booking) {
            return res.status(403).json({
                success: false,
                message: 'You can rate this worker once they have completed a job for you.'
            });
        }

        const alreadyRated = await Rating.findOne({ bookingId: booking._id, customerId: req.user.id });
        if (alreadyRated) {
            return res.status(409).json({ success: false, message: 'You have already rated this job.' });
        }

        const created = await Rating.create({
            customerId: req.user.id,
            workerId,
            bookingId: booking._id,
            rating,
            tags: Array.isArray(tags) ? tags : [],
            comment
        });

        await refreshWorkerRatingStats(workerId);

        res.status(201).json({ success: true, data: created });
    } catch (err) {
        console.error('createRating error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getWorkerRatings = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.workerId)) {
            return res.status(400).json({ success: false, message: 'Invalid worker id' });
        }
        const ratings = await Rating.find({ workerId: req.params.workerId })
            .sort({ createdAt: -1 })
            .populate('customerId', 'name');
        res.status(200).json({ success: true, data: ratings });
    } catch (err) {
        console.error('getWorkerRatings error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
