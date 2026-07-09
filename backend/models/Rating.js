const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    tags: { type: [String], default: [] },
    comment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Rating', RatingSchema);
