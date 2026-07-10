const AuditLog = require('../models/AuditLog');
const { maskPhone, maskUPI, maskBankAccount } = require('../utils/analyticsHelpers');

/**
 * Creates an audit log entry.
 * Built to be fail-safe; it will never crash the main application flow.
 */
exports.createAuditLog = async ({
  actorId,
  actorRole,
  actorName,
  action,
  entityType,
  entityId,
  description,
  metadata = {},
  ipAddress,
  userAgent,
  severity = 'low'
}) => {
  try {
    // Basic validation for required enums to avoid schema validation crashes
    const validRoles = ["customer", "worker", "admin", "system"];
    const validSeverities = ["low", "medium", "high", "critical"];

    const role = validRoles.includes(actorRole) ? actorRole : "system";
    const logSeverity = validSeverities.includes(severity) ? severity : "low";

    // Deep clone metadata to mask sensitive info before saving
    let safeMetadata = {};
    if (metadata) {
      try {
        safeMetadata = JSON.parse(JSON.stringify(metadata));
      } catch (e) {
        safeMetadata = { error: 'Could not parse original metadata' };
      }
      
      // Mask known sensitive keys in the first level of metadata
      const sensitiveKeys = ['password', 'otp', 'token', 'jwt', 'secret'];
      Object.keys(safeMetadata).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
          safeMetadata[key] = '***MASKED***';
        }
        if (lowerKey.includes('phone')) {
          safeMetadata[key] = maskPhone(safeMetadata[key]);
        }
        if (lowerKey.includes('accountnumber')) {
          safeMetadata[key] = maskBankAccount(safeMetadata[key]);
        }
        if (lowerKey.includes('upi')) {
          safeMetadata[key] = maskUPI(safeMetadata[key]);
        }
        if (lowerKey.includes('url') && (lowerKey.includes('document') || lowerKey.includes('proof'))) {
          safeMetadata[key] = '***PRIVATE_URL_MASKED***';
        }
      });
    }

    const logEntry = new AuditLog({
      actorId,
      actorRole: role,
      actorName,
      action,
      entityType,
      entityId,
      description,
      metadata: safeMetadata,
      ipAddress,
      userAgent,
      severity: logSeverity
    });

    // Fire and forget, don't await to block the main thread
    logEntry.save().catch(err => console.error('[AuditService] Failed to save log:', err.message));
    
  } catch (err) {
    console.error('[AuditService] Critical failure in audit logger:', err.message);
  }
};
