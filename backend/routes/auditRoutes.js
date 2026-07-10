const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middlewares/auth');
const { buildDateFilter } = require('../utils/dateRange');
const { createAuditLog } = require('../services/auditService');
const mongoose = require('mongoose');

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

// Middleware to log admin accessing audit logs
router.use(async (req, res, next) => {
  if (req.method === 'GET') {
    await createAuditLog({
      actorId: req.user._id,
      actorRole: 'admin',
      actorName: req.user.name,
      action: 'VIEWED_AUDIT_LOGS',
      entityType: 'AuditLog',
      description: `Admin viewed audit logs via ${req.path}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      severity: 'medium'
    });
  }
  next();
});

// GET /api/v1/admin/audit-logs
router.get('/', async (req, res) => {
  try {
    const { 
      actorRole, action, entityType, severity, 
      startDate, endDate, search, 
      page = 1, limit = 50 
    } = req.query;
    
    let query = {};
    
    // Filters
    if (actorRole) query.actorRole = actorRole;
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (severity) query.severity = severity;
    
    // Date Range
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      if (endDate) end.setHours(23, 59, 59, 999);
      query = { ...query, ...buildDateFilter('createdAt', start, end) };
    }
    
    // Search (actorName, action, description)
    if (search) {
      query.$or = [
        { actorName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
      
    const total = await AuditLog.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum
        }
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/v1/admin/audit-logs/:id
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Audit Log ID' });
    }
    
    const log = await AuditLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit Log not found' });
    }
    
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
