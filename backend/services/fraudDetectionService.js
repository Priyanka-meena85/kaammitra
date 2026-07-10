const evaluateUserRisk = (user, role) => {
    let riskScore = 0;
    const flags = [];
    let riskLevel = 'low';
    let recommendedAction = 'monitor';

    if (role === 'customer') {
        const metrics = user.customerMetrics || {};
        const total = metrics.totalBookings || 0;
        const cancelled = metrics.cancelledBookings || 0;
        const noShows = metrics.noShowCount || 0;
        const payments = metrics.paymentIssueCount || 0;

        if (total > 3 && (cancelled / total) > 0.5) {
            riskScore += 40;
            flags.push('high_cancellation_rate');
        }
        if (noShows > 1) {
            riskScore += 30;
            flags.push('repeated_no_shows');
        }
        if (payments > 2) {
            riskScore += 20;
            flags.push('payment_issues');
        }
    } else if (role === 'worker') {
        const metrics = user.trustMetrics || {};
        const total = (metrics.completedJobs || 0) + (metrics.cancelledJobs || 0) + (metrics.rejectedJobs || 0);
        
        if (total > 5 && (metrics.rejectedJobs / total) > 0.4) {
            riskScore += 30;
            flags.push('high_rejection_rate');
        }
        if (user.totalReviews > 5 && user.averageRating < 3.0) {
            riskScore += 40;
            flags.push('consistently_low_ratings');
        }
        if (metrics.complaintCount > 2) {
            riskScore += 30;
            flags.push('repeated_complaints');
        }
    }

    if (riskScore >= 70) {
        riskLevel = 'critical';
        recommendedAction = 'block_account';
    } else if (riskScore >= 50) {
        riskLevel = 'high';
        recommendedAction = 'temporarily_restrict';
    } else if (riskScore >= 30) {
        riskLevel = 'medium';
        recommendedAction = 'require_admin_review';
    }

    return {
        riskLevel,
        riskScore,
        flags,
        recommendedAction
    };
};

module.exports = { evaluateUserRisk };
