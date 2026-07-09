const mongoose = require('mongoose');

const CallbackRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    service: { type: String, required: true },
    city: { type: String },
    area: { type: String },
    preferredCallTime: { type: String },
    note: { type: String },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Worker Assigned', 'Closed'],
        default: 'New'
    },
    assignedWorkerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker'
    }
}, { timestamps: true });

module.exports = mongoose.model('CallbackRequest', CallbackRequestSchema);
