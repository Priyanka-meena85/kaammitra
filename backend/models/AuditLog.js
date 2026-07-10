const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId },
  actorRole: { 
    type: String, 
    enum: ["customer", "worker", "admin", "system"],
    required: true 
  },
  actorName: { type: String },
  
  action: { type: String, required: true },
  entityType: { type: String },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  description: { type: String },
  
  metadata: { type: Object },
  
  ipAddress: { type: String },
  userAgent: { type: String },
  
  severity: { 
    type: String, 
    enum: ["low", "medium", "high", "critical"], 
    default: "low" 
  }
}, { timestamps: true });

// Indexes for fast searching/filtering in admin analytics
auditLogSchema.index({ actorId: 1 });
auditLogSchema.index({ actorRole: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entityType: 1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
