const Customer = require('../models/Customer');
const Worker = require('../models/Worker');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const otpService = require('../services/otpService');

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
            role, name, phone, password, services, location, address, city, area, phoneVerified, 
            expectedCharge, skills, experience, workingHoursStart, workingHoursEnd, 
            emergencyAvailable, maxTravelDistance,
            profilePhotoUrl, profilePhotoPublicId, idDocumentUrl, idDocumentPublicId,
            addressProofUrl, addressProofPublicId, documentType
        } = req.body;

        if (!phone || !phoneVerified) {
            return res.status(400).json({ success: false, error: 'Phone verification is required' });
        }

        // Check for duplicates
        let existingUser = await Customer.findOne({ phone });
        if (!existingUser) existingUser = await Worker.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Phone number already registered' });
        }

        if (role === 'worker') {
            const worker = await Worker.create({
                name, phone, password, services, location, address, city, area, 
                phoneVerified: true, isVerified: false, verificationStatus: 'Pending Verification', isBlocked: false,
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

// @desc    Send OTP for login/register
// @route   POST /api/v1/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone || phone.length !== 10) {
            return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit phone number' });
        }
        
        const result = await otpService.sendOtp(phone);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
    try {
        const { phone, otp, role, action } = req.body;
        
        const isValid = otpService.verifyOtp(phone, otp);
        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // If it's just a verification step for registration, return success
        if (action === 'register') {
            return res.status(200).json({ success: true, message: 'Phone verified successfully' });
        }

        // If it's a login action, find user and return token
        let user;
        if (role === 'customer') {
            user = await Customer.findOne({ phone });
        } else if (role === 'worker') {
            user = await Worker.findOne({ phone });
        } else if (role === 'admin') {
            user = await Admin.findOne({ username: phone });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
