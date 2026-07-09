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
    }
});

module.exports = mongoose.model('Service', ServiceSchema);
