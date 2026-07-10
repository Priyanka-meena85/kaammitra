const mongoose = require('mongoose');

const matchEventSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  service: { type: String },
  city: { type: String },
  area: { type: String },
  urgency: { type: Boolean, default: false },
  
  resultsCount: { type: Number, default: 0 },
  topWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  topScore: { type: Number },
  
  selectedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  wasBookingCreated: { type: Boolean, default: false }
}, { timestamps: true });

matchEventSchema.index({ createdAt: -1 });
matchEventSchema.index({ city: 1 });
matchEventSchema.index({ service: 1 });
matchEventSchema.index({ wasBookingCreated: 1 });

module.exports = mongoose.model('MatchEvent', matchEventSchema);
