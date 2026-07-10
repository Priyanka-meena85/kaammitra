const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userModel', required: true },
    userModel: { type: String, required: true, enum: ['Customer', 'Worker'] },
    planName: { type: String, required: true }, // e.g., 'KaamMitra Plus', 'Featured Worker'
    planType: { type: String, required: true, enum: ['monthly', 'yearly'] },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['active', 'cancelled', 'past_due', 'pending'], default: 'pending' },
    razorpaySubscriptionId: { type: String, unique: true, sparse: true }, // Sparse allows nulls to be unique
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    autoRenew: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
