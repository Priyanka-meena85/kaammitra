const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    iconUrl: {
        type: String
    },
    hindiName: {
        type: String,
        required: true
    },
    englishName: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    description: {
        type: String
    },
    startingPrice: {
        type: Number
    },
    minPrice: {
        type: Number
    },
    maxPrice: {
        type: Number
    },
    priceNote: {
        type: String
    },
    visitCharge: {
        type: Number
    },
    inspectionRequired: {
        type: Boolean,
        default: false
    },
    emergencyAvailable: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', ServiceSchema);
