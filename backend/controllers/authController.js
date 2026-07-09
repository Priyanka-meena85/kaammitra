const Customer = require('../models/Customer');
const Worker = require('../models/Worker');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

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
        const { role, name, phone, password, services, location, address } = req.body;

        if (role === 'worker') {
            const worker = await Worker.create({
                name, phone, password, services, location, address
            });
            sendTokenResponse(worker, 201, res);
        } else {
            const customer = await Customer.create({
                name, phone, password, location, address
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
            // Using username for admin instead of phone
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
