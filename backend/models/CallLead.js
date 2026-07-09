const mongoose = require('mongoose');

const callLeadSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerPhone: { type: String },
  workerName: { type: String },
  workerPhone: { type: String },
  service: { type: String },
  source: { type: String, enum: ['call', 'whatsapp'] },
  pageSource: { type: String },
  status: { type: String, enum: ['New', 'Contacted', 'Converted', 'Lost'], default: 'New' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CallLead', callLeadSchema);
