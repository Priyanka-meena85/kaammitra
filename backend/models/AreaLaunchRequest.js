const mongoose = require('mongoose');

const AreaLaunchRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    service: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['New', 'Contacted', 'Planned', 'Launched'],
        default: 'New'
    }
}, { timestamps: true });

module.exports = mongoose.model('AreaLaunchRequest', AreaLaunchRequestSchema);
