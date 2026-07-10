const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        required: true
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    reviewerRole: {
        type: String,
        enum: ['customer', 'worker'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    targetRole: {
        type: String,
        enum: ['customer', 'worker'],
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    title: {
        type: String
    },
    comment: {
        type: String
    },
    tags: [{
        type: String
    }],
    photos: [{
        url: String,
        publicId: String
    }],
    status: {
        type: String,
        enum: ['visible', 'pending_moderation', 'hidden', 'reported'],
        default: 'visible'
    },
    isVerifiedBooking: {
        type: Boolean,
        default: true
    },
    helpfulCount: {
        type: Number,
        default: 0
    },
    reportedCount: {
        type: Number,
        default: 0
    },
    moderationNote: {
        type: String
    },
    moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin' // Assuming Admin model might exist or just store ID
    },
    moderatedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes
reviewSchema.index({ bookingId: 1 });
reviewSchema.index({ customerId: 1 });
reviewSchema.index({ workerId: 1 });
reviewSchema.index({ targetId: 1, targetRole: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
