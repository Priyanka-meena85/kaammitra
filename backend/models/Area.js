const mongoose = require('mongoose');

const AreaSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true
    },
    areaName: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    workerCount: {
        type: Number,
        default: 0
    },
    topServices: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Area', AreaSchema);
