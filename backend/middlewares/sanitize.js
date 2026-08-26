// Strips MongoDB operator keys ($gt, $ne, $where, dotted paths) out of request
// bodies before they can reach a query. Mongoose schema casting already blocks
// most of this, but casting does not apply to every path and defence in depth is
// cheap here.
//
// Written by hand rather than using express-mongo-sanitize because Express 5
// makes req.query a read-only getter, which that package tries to reassign.

const scrub = (value) => {
    if (Array.isArray(value)) return value.map(scrub);
    if (value === null || typeof value !== 'object') return value;
    if (value instanceof Date) return value;

    const clean = {};
    for (const [key, val] of Object.entries(value)) {
        if (key.startsWith('$') || key.includes('.')) continue;
        clean[key] = scrub(val);
    }
    return clean;
};

module.exports = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = scrub(req.body);
    }
    next();
};
