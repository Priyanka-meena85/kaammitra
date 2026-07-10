const mongoose = require('mongoose');

const safetyReportSchema = new mongoose.Schema({
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    reporterRole: {
        type: String,
        enum: ['customer', 'worker', 'admin'],
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
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    type: {
        type: String,
        enum: [
            'unsafe_behavior', 'harassment', 'fraud', 'payment_issue', 
            'fake_profile', 'wrong_address', 'no_show', 'damage_claim', 
            'overcharging', 'threat', 'other'
        ],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    description: {
        type: String,
        required: true
    },
    evidence: [{
        url: String,
        publicId: String
    }],
    status: {
        type: String,
        enum: ['open', 'under_review', 'resolved', 'rejected'],
        default: 'open'
    },
    adminNote: {
        type: String
    },
    actionTaken: {
        type: String
    },
    resolvedAt: {
        type: Date
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Indexes
safetyReportSchema.index({ reporterId: 1 });
safetyReportSchema.index({ targetId: 1, targetRole: 1 });
safetyReportSchema.index({ type: 1 });
safetyReportSchema.index({ severity: 1 });
safetyReportSchema.index({ status: 1 });
safetyReportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SafetyReport', safetyReportSchema);
