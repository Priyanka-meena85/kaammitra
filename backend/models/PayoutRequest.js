const mongoose = require('mongoose');

const PayoutRequestSchema = new mongoose.Schema({
    workerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Worker',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "paid"],
        default: "pending"
    },
    bankDetailsSnapshot: {
        accountHolderName: String,
        bankName: String,
        accountNumberMasked: String,
        ifscMasked: String,
        upiIdMasked: String
    },
    adminNote: {
        type: String
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    processedAt: {
        type: Date
    },
    processedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User' // Assuming Admin uses User model
    },
    transactionReference: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PayoutRequest', PayoutRequestSchema);
