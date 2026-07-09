const mongoose = require('mongoose');

const EmergencyLeadSchema = new mongoose.Schema({
    service: { type: String, required: true },
    phone: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    area: { type: String },
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

module.exports = mongoose.model('EmergencyLead', EmergencyLeadSchema);
