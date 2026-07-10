const Customer = require('../models/Customer');
const Worker = require('../models/Worker');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const admin = require('../config/firebase');

const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
    res.status(statusCode).json({ success: true, token, user });
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

        // Verify Firebase Token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, phone_number } = decodedToken;

        if (!phone_number) {
            return res.status(400).json({ success: false, error: 'Phone number not found in Firebase token' });
        }

        // Normalize phone number (Firebase returns +91XXXXXXXXXX)
        const phone = String(phone_number).replace(/\D/g, '').slice(-10);

        // Check for duplicates
        let existingUser = await Customer.findOne({ phone });
        if (!existingUser) existingUser = await Worker.findOne({ phone });
        
        if (existingUser) {
            // Update firebaseUid if it was missing and return error that user exists (or proceed? The prompt says: "If a user with the verified phone already exists: update firebaseUid, set isPhoneVerified to true, preserve all existing profile and role data"). But this is the register route. If they are already registered, they should just login.
            if (!existingUser.firebaseUid || !existingUser.isPhoneVerified) {
                existingUser.firebaseUid = uid;
                existingUser.isPhoneVerified = true;
                await existingUser.save();
            }
            return res.status(400).json({ success: false, error: 'Phone number already registered. Please login.' });
        }

        if (role === 'worker') {
            const worker = await Worker.create({
                firebaseUid: uid,
                name, phone, password, services, location, address, city, area, 
                phoneVerified: true, isPhoneVerified: true, isVerified: false, verificationStatus: 'Pending Verification', isBlocked: false,
                expectedCharge, skills, experience, workingHoursStart, workingHoursEnd, emergencyAvailable, maxTravelDistance,
                profilePhotoUrl, profilePhotoPublicId, idDocumentUrl, idDocumentPublicId,
                addressProofUrl, addressProofPublicId, documentType
            });
            sendTokenResponse(worker, 201, res);
        } else {
            const customer = await Customer.create({
                name, phone, password, location, address, city, area, phoneVerified: true
            });
            sendTokenResponse(customer, 201, res);
        }
    } catch (err) {
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

        // Verify Firebase Token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, phone_number } = decodedToken;

        if (!phone_number) {
            return res.status(400).json({ success: false, error: 'Phone number not found in Firebase token' });
        }

        const phone = String(phone_number).replace(/\D/g, '').slice(-10);

        let user = await Customer.findOne({ phone });
        if (!user) user = await Worker.findOne({ phone });
        if (!user) {
             // Admin doesn't typically login with OTP, but just in case
             user = await Admin.findOne({ username: phone });
        }

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found. Please register first.' });
        }

        // Update firebaseUid and verification status if not set
        if (!user.firebaseUid || !user.isPhoneVerified) {
            user.firebaseUid = uid;
            user.isPhoneVerified = true;
            // Also update phoneVerified for backward compatibility
            if (user.phoneVerified !== undefined) {
                 user.phoneVerified = true;
            }
            await user.save();
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error("Firebase Login Error:", err);
        res.status(401).json({ success: false, error: 'Invalid Firebase ID token' });
    }
};
