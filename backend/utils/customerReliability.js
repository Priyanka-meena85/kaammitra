const calculateCustomerReliability = (customerData) => {
    let score = 0;
    let riskLevel = 'low';
    const metrics = customerData.customerMetrics || {};

    const total = metrics.totalBookings || 0;
    const completed = metrics.completedBookings || 0;
    const cancelled = metrics.cancelledBookings || 0;
    const noShows = metrics.noShowCount || 0;
    const paymentIssues = metrics.paymentIssueCount || 0;
    const complaints = metrics.complaintCount || 0;

    // 1. Completed booking rate: 35
    if (total === 0) {
        score += 35; // Default for new customers
    } else {
        const rate = completed / total;
        score += (rate * 35);
    }

    // 2. Payment behavior: 25
    if (paymentIssues === 0) {
        score += 25;
    } else {
        const issueRate = paymentIssues / Math.max(total, 1);
        if (issueRate < 0.1) score += 15;
        else if (issueRate < 0.3) score += 5;
    }

    // 3. Cancellation behavior: 20
    if (cancelled === 0) {
        score += 20;
    } else {
        const cancelRate = cancelled / Math.max(total, 1);
        if (cancelRate < 0.2) score += 15;
        else if (cancelRate < 0.5) score += 5;
    }

    // 4. Complaint behavior: 10
    if (complaints === 0) {
        score += 10;
    } else {
        const complaintRate = complaints / Math.max(total, 1);
        if (complaintRate < 0.1) score += 5;
    }

    // 5. Worker feedback: 10
    // Simplified: Give full 10 if not flagged by workers
    if (!customerData.isFlagged) {
        score += 10;
    }

    // Deductions
    let deductions = 0;
    if (noShows > 0) {
        deductions += (noShows * 10);
    }
    
    if (customerData.riskLevel === 'critical') {
        deductions += 40;
    } else if (customerData.riskLevel === 'high') {
        deductions += 20;
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(score - deductions)));

    if (customerData.isBlocked) {
        riskLevel = 'critical';
    } else if (finalScore < 40) {
        riskLevel = 'high';
    } else if (finalScore < 60) {
        riskLevel = 'medium';
    } else {
        riskLevel = 'low';
    }

    return {
        reliabilityScore: finalScore,
        riskLevel
    };
};

module.exports = { calculateCustomerReliability };
