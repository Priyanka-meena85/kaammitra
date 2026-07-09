const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Worker = require('../models/Worker');
const Admin = require('../models/Admin');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        let user;
        if (decoded.role === 'customer') {
            user = await Customer.findById(decoded.id);
        } else if (decoded.role === 'worker') {
            user = await Worker.findById(decoded.id);
        } else if (decoded.role === 'admin') {
            user = await Admin.findById(decoded.id);
        }

        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};
