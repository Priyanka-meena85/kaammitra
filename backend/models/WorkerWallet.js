const mongoose = require('mongoose');

const WorkerWalletSchema = new mongoose.Schema({
    workerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Worker',
        required: true,
        unique: true
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    availableBalance: {
        type: Number,
        default: 0
    },
    pendingBalance: {
        type: Number,
        default: 0
    },
    withdrawnAmount: {
        type: Number,
        default: 0
    },
    transactions: [
        {
            type: {
                type: String,
                enum: [
                    "earning",
                    "commission_deducted",
                    "payout_requested",
                    "payout_approved",
                    "payout_rejected",
                    "refund_adjustment"
                ],
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            bookingId: {
                type: mongoose.Schema.ObjectId,
                ref: 'Booking'
            },
            paymentId: {
                type: mongoose.Schema.ObjectId,
                ref: 'Payment'
            },
            description: {
                type: String
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('WorkerWallet', WorkerWalletSchema);
