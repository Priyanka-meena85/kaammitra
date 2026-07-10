const Customer = require('../models/Customer');
const Worker = require('../models/Worker');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { firebaseAuth } = require('../config/firebaseAdmin');
const { createAuditLog } = require('../services/auditService');

const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
    res.status(statusCode).json({ success: true, token, user });
};

const normalizeIndianPhone = (value = "") => {
  const digits = String(value).replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 13 && digits.startsWith("091")) return `+91${digits.slice(3)}`;
  return digits.startsWith("+") ? digits : `+${digits}`;
};

const getPhoneVariants = (phone = "") => {
  const normalized = normalizeIndianPhone(phone);
  const digits = normalized.replace(/\D/g, "");
  const tenDigit = digits.slice(-10);

  return [
    normalized,
    digits,
    tenDigit,
    `91${tenDigit}`,
    `+91${tenDigit}`,
  ].filter(Boolean);
};

// @desc    Register user (Customer or Worker)
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { 
            role, name, idToken, password, services, location, address, city, area,
            expectedCharge, skills, experience, workingHoursStart, workingHoursEnd, 
            emergencyAvailable, maxTravelDistance,
            profilePhotoUrl, profilePhotoPublicId, idDocumentUrl, idDocumentPublicId,
            addressProofUrl, addressProofPublicId, documentType
        } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, error: 'Firebase ID token is required' });
        }

        if (!firebaseAuth) {
            return res.status(503).json({ success: false, message: 'Firebase Admin is not configured on the server' });
        }

        // Verify Firebase Token
        let decodedToken;
        try {
            decodedToken = await firebaseAuth.verifyIdToken(idToken);
        } catch (error) {
            console.error("Firebase register verification failed:", error.message);
            return res.status(401).json({ success: false, error: 'Invalid Firebase ID token' });
        }

        const { uid, phone_number } = decodedToken;

        if (!phone_number) {
            return res.status(400).json({ success: false, error: 'Phone number not found in Firebase token' });
        }

        // Normalize phone number (E.164 format: +91XXXXXXXXXX)
        const rawPhone = String(phone_number).replace(/\D/g, '');
        const phone10 = rawPhone.slice(-10);
        const phoneE164 = `+91${phone10}`;
        const phoneLookup = [phone10, phoneE164, rawPhone];

        let existingUser = null;

        if (role === 'worker') {
            existingUser = await Worker.findOne({ $or: [{ firebaseUid: uid }, { phone: { $in: phoneLookup } }] });
        } else {
            existingUser = await Customer.findOne({ $or: [{ firebaseUid: uid }, { phone: { $in: phoneLookup } }] });
        }
        
        if (existingUser) {
            if (!existingUser.firebaseUid || !existingUser.isPhoneVerified) {
                existingUser.firebaseUid = uid;
                existingUser.isPhoneVerified = true;
                // Update their phone to standard format if it wasn't
                existingUser.phone = phoneE164;
                await existingUser.save();
            }
            const roleName = role === 'worker' ? 'Worker' : 'Customer';
            return res.status(400).json({ success: false, error: `${roleName} account already exists. Please login as ${role}.` });
        }

        if (role === 'worker') {
            const worker = await Worker.create({
                firebaseUid: uid,
                name, phone: phoneE164, password, services, location, address, city, area, 
                phoneVerified: true, isPhoneVerified: true, isVerified: false, verificationStatus: 'Pending Verification', isBlocked: false,
                expectedCharge, skills, experience, workingHoursStart, workingHoursEnd, emergencyAvailable, maxTravelDistance,
                profilePhotoUrl, profilePhotoPublicId, idDocumentUrl, idDocumentPublicId,
                addressProofUrl, addressProofPublicId, documentType
            });
            const { createNotification } = require('../services/notificationService');
            createNotification({
                recipientId: worker._id, recipientRole: 'worker', type: 'worker_verification_pending',
                title: 'Verification Pending', message: 'Your worker account is pending admin verification.', link: '/worker-dashboard'
            });
            const Admin = require('../models/Admin');
            const admin = await Admin.findOne();
            if (admin) {
                createNotification({
                    recipientId: admin._id, recipientRole: 'admin', type: 'worker_verification_pending',
                    title: 'New Worker Verification', message: `Worker ${name} registered and needs verification.`, link: '/admin-dashboard'
                });
            }
            
            await createAuditLog({
                actorId: worker._id,
                actorRole: 'worker',
                actorName: worker.name,
                action: 'WORKER_REGISTERED',
                entityType: 'Worker',
                entityId: worker._id,
                description: 'Worker registered successfully via Firebase',
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
                severity: 'medium'
            });
            
            sendTokenResponse(worker, 201, res);
        } else {
            const customer = await Customer.create({
                firebaseUid: uid,
                name, phone: phoneE164, password, location, address, city, area, 
                phoneVerified: true, isPhoneVerified: true
            });
            
            await createAuditLog({
                actorId: customer._id,
                actorRole: 'customer',
                actorName: customer.name,
                action: 'CUSTOMER_REGISTERED',
                entityType: 'Customer',
                entityId: customer._id,
                description: 'Customer registered successfully via Firebase',
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
                severity: 'low'
            });

            sendTokenResponse(customer, 201, res);
        }
    } catch (err) {
        console.error("Register Error:", err);
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { phone, password, role } = req.body;

        if (!phone || !password || !role) {
            return res.status(400).json({ success: false, error: 'Please provide phone, password and role' });
        }
        
        if (role !== 'admin') {
            phone = String(phone).replace(/\D/g, '').slice(-10);
        }

        let user;
        if (role === 'customer') {
            user = await Customer.findOne({ phone }).select('+password');
        } else if (role === 'worker') {
            user = await Worker.findOne({ phone }).select('+password');
        } else if (role === 'admin') {
            user = await Admin.findOne({ username: phone }).select('+password');
        }

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        await createAuditLog({
            actorId: user._id,
            actorRole: role,
            actorName: user.name || user.username,
            action: 'USER_LOGIN',
            entityType: 'User',
            entityId: user._id,
            description: `${role} logged in via password`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: 'low'
        });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    res.status(200).json({ success: true, data: req.user });
};

// @desc    Firebase Login
// @route   POST /api/v1/auth/firebase-login
// @access  Public
exports.firebaseLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, error: 'Firebase ID token is required' });
        }

        if (!firebaseAuth) {
            return res.status(503).json({ success: false, message: 'Firebase Admin is not configured on the server' });
        }

        let decodedToken;
        try {
            decodedToken = await firebaseAuth.verifyIdToken(idToken);
        } catch (error) {
            if (
              error.code === "auth/id-token-expired" ||
              error.code === "auth/argument-error" ||
              error.code === "auth/invalid-id-token"
            ) {
              return res.status(401).json({
                success: false,
                message: "Invalid or expired Firebase token",
              });
            }
            console.error("Firebase login verification failed:", error.message);
            return res.status(500).json({ success: false, message: 'Unable to complete Firebase login' });
        }
        
        const { uid, phone_number } = decodedToken;

        if (!phone_number) {
            return res.status(400).json({ success: false, error: 'Phone number not found in Firebase token' });
        }

        const variants = getPhoneVariants(phone_number);
        const { role } = req.body;

        let account = null;
        let accountType = null;

        if (role === 'customer' || !role) {
            account = await Customer.findOne({
                $or: [
                    { firebaseUid: uid },
                    { phone: { $in: variants } }
                ],
            });
            if (account) accountType = "customer";
        }

        if (!account && (role === 'worker' || !role)) {
            account = await Worker.findOne({
                $or: [
                    { firebaseUid: uid },
                    { phone: { $in: variants } }
                ],
            });
            if (account) accountType = "worker";
        }
        
        if (!account && (role === 'admin' || !role)) {
            account = await Admin.findOne({
                $or: [
                    { username: { $in: variants } }
                ]
            });
            if (account) accountType = "admin";
        }

        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found. Please register first.' });
        }

        let changed = false;
        if (!account.firebaseUid) {
            account.firebaseUid = uid;
            changed = true;
        }
        if (!account.isPhoneVerified) {
            account.isPhoneVerified = true;
            changed = true;
        }
        
        if (changed) {
            await account.save();
        }

        const token = jwt.sign({ id: account._id, role: account.role || accountType }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        await createAuditLog({
            actorId: account._id,
            actorRole: account.role || accountType,
            actorName: account.name || account.username,
            action: 'USER_LOGIN',
            entityType: 'User',
            entityId: account._id,
            description: `${accountType} logged in via Firebase`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: 'low'
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                _id: account._id,
                name: account.name,
                phone: account.phone || decodedToken.phone_number,
                role: account.role || accountType,
                isPhoneVerified: true,
            }
        });
    } catch (err) {
        console.error("Firebase Login Error:", err.message);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

// @desc    Firebase Status
// @route   GET /api/v1/auth/firebase-status
// @access  Public
exports.firebaseStatus = (req, res) => {
  if (!firebaseAuth) {
    return res.status(503).json({
      success: false,
      firebaseConfigured: false,
      message: "Firebase Admin is not configured",
      errorDetails:
        process.env.NODE_ENV !== "production"
          ? require('../config/firebaseAdmin').firebaseInitializationError
          : undefined,
    });
  }

  return res.status(200).json({
    success: true,
    firebaseConfigured: true,
  });
};
