const evaluateWorkerBadges = (worker) => {
    const newBadges = [];
    const existingBadgeTypes = new Set((worker.badges || []).map(b => b.type));

    const awardBadge = (type, label) => {
        if (!existingBadgeTypes.has(type)) {
            newBadges.push({ type, label, awardedAt: new Date() });
        }
    };

    // Verified Worker
    if (worker.isVerified && worker.verificationStatus === 'Verified') {
        awardBadge('verified', 'Verified Worker');
    }

    // Top Rated
    if (worker.averageRating >= 4.5 && worker.totalReviews >= 5) {
        awardBadge('top_rated', 'Top Rated');
    }

    // Fast Responder
    if (worker.trustMetrics?.responseTimeMinutes <= 15) {
        awardBadge('fast_responder', 'Fast Responder');
    }

    // Emergency Ready
    if (worker.emergencyAvailable && worker.trustScore >= 70) {
        awardBadge('emergency_ready', 'Emergency Ready');
    }

    // Trusted Pro
    if (worker.trustScore >= 85) {
        awardBadge('trusted_pro', 'Trusted Pro');
    }

    // Jobs Completed
    const completed = worker.trustMetrics?.completedJobs || worker.completedJobs || 0;
    if (completed >= 50) {
        awardBadge('50_jobs', '50 Jobs Completed');
    }
    if (completed >= 100) {
        awardBadge('100_jobs', '100 Jobs Completed');
    }

    // Low Complaint Rate
    if (completed > 10) {
        const complaints = worker.trustMetrics?.complaintCount || 0;
        if (complaints / completed < 0.03) {
            awardBadge('low_complaint', 'Low Complaint Rate');
        }
    }

    return [...(worker.badges || []), ...newBadges];
};

module.exports = { evaluateWorkerBadges };
