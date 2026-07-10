/**
 * Calculates percentage growth between current and previous periods.
 */
exports.calculateGrowth = (current, previous) => {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    const growth = ((current - previous) / previous) * 100;
    return parseFloat(growth.toFixed(2));
};

/**
 * Returns a safe percentage, handling division by zero.
 */
exports.safePercent = (part, total) => {
    if (total === 0) return 0;
    return parseFloat(((part / total) * 100).toFixed(2));
};

/**
 * Returns a MongoDB aggregation group pipeline stage for grouping by day.
 */
exports.groupByDayAggregation = (dateField = '$createdAt') => {
    return {
        $dateToString: { format: "%Y-%m-%d", date: dateField }
    };
};

/**
 * Masks a phone number (e.g., 9876543210 -> 9876****10)
 */
exports.maskPhone = (phone) => {
    if (!phone) return 'N/A';
    const strPhone = String(phone);
    if (strPhone.length < 8) return strPhone;
    
    // Check if it has a country code
    if (strPhone.startsWith('+')) {
        const prefix = strPhone.slice(0, 6); // e.g., +9198
        const suffix = strPhone.slice(-2);
        return `${prefix}${'*'.repeat(strPhone.length - 8)}${suffix}`;
    }
    
    const prefix = strPhone.slice(0, 4);
    const suffix = strPhone.slice(-2);
    return `${prefix}${'*'.repeat(strPhone.length - 6)}${suffix}`;
};

/**
 * Masks a UPI ID (e.g., testuser@upi -> test***@upi)
 */
exports.maskUPI = (upi) => {
    if (!upi) return 'N/A';
    const [name, domain] = upi.split('@');
    if (!domain) return upi; // Not a valid UPI, but return it
    
    if (name.length <= 3) {
        return `${name[0]}***@${domain}`;
    }
    
    const maskedName = `${name.slice(0, 3)}${'*'.repeat(name.length - 3)}`;
    return `${maskedName}@${domain}`;
};

/**
 * Masks a Bank Account Number (e.g., 1234567890 -> ******7890)
 */
exports.maskBankAccount = (account) => {
    if (!account) return 'N/A';
    const strAcc = String(account);
    if (strAcc.length <= 4) return strAcc;
    
    return `${'*'.repeat(strAcc.length - 4)}${strAcc.slice(-4)}`;
};
