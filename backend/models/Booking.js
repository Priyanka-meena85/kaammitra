const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Customer',
        required: true
    },
    workerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Worker'
    },
    serviceId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Service',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    urgency: {
        type: String,
        enum: ['Normal', 'Urgent'],
        default: 'Normal'
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'On the Way', 'In Progress', 'Completed', 'Cancelled', 'Rejected', 'Rated'],
        default: 'Pending'
    },
    date: {
        type: Date,
        default: Date.now
    },
    time: {
        type: String
    },
    statusUpdatedAt: {
        type: Date
    },
    paymentStatus: {
        type: String,
        enum: ["unpaid", "advance_paid", "paid", "failed", "refunded"],
        default: "unpaid"
    },
    paymentMode: {
        type: String,
        enum: ["cash", "online", "mixed"],
        default: "cash"
    },
    totalAmount: {
        type: Number
    },
    advanceAmount: {
        type: Number
    },
    remainingAmount: {
        type: Number
    },
    paymentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Payment'
    },
    commissionStatus: {
        type: String,
        enum: ["not_applicable", "pending", "calculated", "settled"],
        default: "not_applicable"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);
