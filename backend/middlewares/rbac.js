const { rolePermissions } = require('../config/permissions');

exports.requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ success: false, error: 'User role not found' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};

exports.requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ success: false, error: 'User role not found' });
        }

        const userPermissions = rolePermissions[req.user.role];
        
        if (!userPermissions || !userPermissions.includes(permission)) {
            return res.status(403).json({ 
                success: false, 
                error: `User lacks required permission: ${permission}` 
            });
        }

        next();
    };
};
