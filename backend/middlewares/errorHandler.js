// Unmatched API routes previously fell through to Express's default HTML error
// page, which a JSON client cannot parse. Answer in the shape the app expects.
exports.notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
};

exports.errorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err);

    // CORS rejections should read as a refusal, not a server fault.
    if (err.message && err.message.includes('CORS policy')) {
        return res.status(403).json({ success: false, message: 'Origin not allowed' });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: err.message });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: `Invalid ${err.path}` });
    }

    // Duplicate key — most often a phone number that already has an account.
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'value';
        return res.status(409).json({ success: false, message: `That ${field} is already registered.` });
    }

    if (err.type === 'entity.too.large') {
        return res.status(413).json({ success: false, message: 'Request body is too large.' });
    }

    console.error('Unhandled error:', err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: 'Something went wrong on our side. Please try again.',
        // Never leak internals to a production client.
        ...(process.env.NODE_ENV !== 'production' && { error: err.message, stack: err.stack })
    });
};
