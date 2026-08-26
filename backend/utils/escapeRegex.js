// User-supplied search text is interpolated into RegExp objects for
// case-insensitive matching. Without escaping, input like ".*" matches every
// row and input like "(a+)+$" is a ReDoS vector, so always escape first.
const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Case-insensitive exact match on an escaped literal.
const exactMatch = (value) => new RegExp(`^${escapeRegex(value)}$`, 'i');

module.exports = { escapeRegex, exactMatch };
