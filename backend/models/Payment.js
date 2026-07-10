const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Booking',
        required: true,
        index: true
    },
    customerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Customer',
        required: true,
        index: true
    },
    workerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Worker',
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    paymentType: {
        type: String,
        enum: ["advance", "full", "remaining"],
        required: true
    },
    razorpayOrderId: {
        type: String,
        sparse: true,
        unique: true
    },
    razorpayPaymentId: {
        type: String,
        sparse: true,
        unique: true
    },
    razorpaySignature: {
        type: String
    },
    status: {
        type: String,
        enum: [
            "created",
            "pending",
            "paid",
            "failed",
            "refunded",
            "cancelled"
        ],
        default: "created"
    },
    platformCommissionPercent: {
        type: Number
    },
    platformCommissionAmount: {
        type: Number
    },
    workerEarningAmount: {
        type: Number
    },
    paymentMethod: {
        type: String
    },
    paidAt: {
        type: Date
    },
    failureReason: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);
