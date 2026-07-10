const express = require('express');
const router = express.Router();
const { stringify } = require('csv-stringify');
const { protect, authorize } = require('../middlewares/auth');
const { getDateRange, buildDateFilter } = require('../utils/dateRange');
const { maskPhone, maskUPI, maskBankAccount } = require('../utils/analyticsHelpers');
const { createAuditLog } = require('../services/auditService');

const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const PayoutRequest = require('../models/PayoutRequest');
const Complaint = require('../models/Complaint');
const AuditLog = require('../models/AuditLog');

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

// Helper to log exports
const logExport = async (req, type) => {
  await createAuditLog({
    actorId: req.user._id,
    actorRole: 'admin',
    actorName: req.user.name,
    action: 'EXPORTED_REPORT',
    entityType: 'Report',
    description: `Admin exported ${type} report as CSV`,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    severity: 'medium'
  });
};

// Stream helper
const streamCSV = (res, filename, columns, cursor, transformFn) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="kaammitra-${filename}.csv"`);
  
  const stringifier = stringify({ header: true, columns });
  stringifier.pipe(res);
  
  cursor.on('data', (doc) => {
    stringifier.write(transformFn(doc));
  });
  
  cursor.on('end', () => {
    stringifier.end();
  });
  
  cursor.on('error', (err) => {
    console.error('CSV Stream error:', err);
    res.status(500).end('Error generating CSV');
  });
};

// GET /api/v1/admin/exports/bookings.csv
router.get('/bookings.csv', async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const dateFilter = buildDateFilter('createdAt', start, end);
    const cityFilter = req.query.city ? { city: req.query.city } : {};
    
    await logExport(req, 'Bookings');
    
    const cursor = Booking.find({ ...dateFilter, ...cityFilter })
      .populate('customerId', 'name phone')
      .populate('workerId', 'name phone')
      .cursor();
      
    const columns = ['ID', 'Date', 'Status', 'Service', 'Customer Name', 'Worker Name', 'City', 'Area', 'Total Price'];
    
    streamCSV(res, 'bookings', columns, cursor, (b) => [
      b._id.toString(),
      b.createdAt.toISOString(),
      b.status,
      b.service,
      b.customerId?.name || 'N/A',
      b.workerId?.name || 'Unassigned',
      b.city,
      b.area,
      b.totalPrice || 0
    ]);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// GET /api/v1/admin/exports/workers.csv
router.get('/workers.csv', async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const dateFilter = buildDateFilter('createdAt', start, end);
    const cityFilter = req.query.city ? { city: req.query.city } : {};
    
    await logExport(req, 'Workers');
    
    const cursor = Worker.find({ ...dateFilter, ...cityFilter }).cursor();
    const columns = ['ID', 'Registered Date', 'Name', 'Phone', 'City', 'Area', 'Services', 'Status', 'Trust Score', 'Rating'];
    
    streamCSV(res, 'workers', columns, cursor, (w) => [
      w._id.toString(),
      w.createdAt.toISOString(),
      w.name,
      maskPhone(w.phone),
      w.city,
      w.area,
      w.services?.join(', '),
      w.verificationStatus,
      w.trustScore,
      w.averageRating || 0
    ]);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// GET /api/v1/admin/exports/customers.csv
router.get('/customers.csv', async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const dateFilter = buildDateFilter('createdAt', start, end);
    const cityFilter = req.query.city ? { city: req.query.city } : {};
    
    await logExport(req, 'Customers');
    
    const cursor = Customer.find({ ...dateFilter, ...cityFilter }).cursor();
    const columns = ['ID', 'Registered Date', 'Name', 'Phone', 'City', 'Area'];
    
    streamCSV(res, 'customers', columns, cursor, (c) => [
      c._id.toString(),
      c.createdAt.toISOString(),
      c.name,
      maskPhone(c.phone),
      c.city,
      c.area || 'N/A'
    ]);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// GET /api/v1/admin/exports/payments.csv
router.get('/payments.csv', async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const dateFilter = buildDateFilter('createdAt', start, end);
    
    await logExport(req, 'Payments');
    
    const cursor = Payment.find({ ...dateFilter })
      .populate('customerId', 'name')
      .populate('workerId', 'name')
      .cursor();
      
    const columns = ['ID', 'Date', 'Status', 'Amount', 'Platform Fee', 'Worker Amount', 'Customer', 'Worker', 'Razorpay Order ID'];
    
    streamCSV(res, 'payments', columns, cursor, (p) => [
      p._id.toString(),
      p.createdAt.toISOString(),
      p.status,
      p.amount,
      p.platformFee,
      p.workerAmount,
      p.customerId?.name || 'N/A',
      p.workerId?.name || 'N/A',
      p.razorpayOrderId || 'N/A'
    ]);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// GET /api/v1/admin/exports/payouts.csv
router.get('/payouts.csv', async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const dateFilter = buildDateFilter('createdAt', start, end);
    
    await logExport(req, 'Payouts');
    
    const cursor = PayoutRequest.find({ ...dateFilter })
      .populate('workerId', 'name phone')
      .cursor();
      
    const columns = ['ID', 'Date', 'Status', 'Worker Name', 'Worker Phone', 'Amount', 'Bank Acc Name', 'Bank Acc No', 'IFSC', 'UPI ID', 'Tx Ref'];
    
    streamCSV(res, 'payouts', columns, cursor, (p) => [
      p._id.toString(),
      p.createdAt.toISOString(),
      p.status,
      p.workerId?.name || 'N/A',
      maskPhone(p.workerId?.phone),
      p.amount,
      p.bankDetailsSnapshot?.accountHolderName || 'N/A',
      maskBankAccount(p.bankDetailsSnapshot?.accountNumber),
      p.bankDetailsSnapshot?.ifsc || 'N/A',
      maskUPI(p.bankDetailsSnapshot?.upiId),
      p.transactionReference || ''
    ]);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// GET /api/v1/admin/exports/complaints.csv
router.get('/complaints.csv', async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const dateFilter = buildDateFilter('createdAt', start, end);
    
    await logExport(req, 'Complaints');
    
    const cursor = Complaint.find({ ...dateFilter })
      .populate('customerId', 'name')
      .populate('workerId', 'name')
      .cursor();
      
    const columns = ['ID', 'Date', 'Status', 'Type', 'Customer', 'Worker', 'Description', 'Admin Note'];
    
    streamCSV(res, 'complaints', columns, cursor, (c) => [
      c._id.toString(),
      c.createdAt.toISOString(),
      c.status,
      c.complaintType,
      c.customerId?.name || 'N/A',
      c.workerId?.name || 'N/A',
      c.description,
      c.adminNote || ''
    ]);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// GET /api/v1/admin/exports/audit-logs.csv
router.get('/audit-logs.csv', async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const dateFilter = buildDateFilter('createdAt', start, end);
    
    await logExport(req, 'AuditLogs');
    
    const cursor = AuditLog.find({ ...dateFilter }).cursor();
    const columns = ['Date', 'Actor Role', 'Actor Name', 'Action', 'Entity Type', 'Entity ID', 'Severity', 'Description', 'IP Address'];
    
    streamCSV(res, 'audit-logs', columns, cursor, (a) => [
      a.createdAt.toISOString(),
      a.actorRole,
      a.actorName || 'System',
      a.action,
      a.entityType || '',
      a.entityId?.toString() || '',
      a.severity,
      a.description || '',
      a.ipAddress || ''
    ]);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
