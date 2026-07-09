const mongoose = require('mongoose');

const callLeadSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  location: { type: String },
  status: { type: String, enum: ['New', 'Contacted', 'Converted', 'Lost'], default: 'New' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CallLead', callLeadSchema);
