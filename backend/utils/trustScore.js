const calculateWorkerTrustScore = (workerData) => {
    let score = 0;
    const breakdown = {
        verification: 0,
        review: 0,
        completion: 0,
        complaint: 0,
        response: 0,
        safety: 0,
        deductions: 0
    };
    let riskLevel = 'low';

    // A. Verification score: 20 points
    if (workerData.verificationStatus === 'Verified' || workerData.verificationStatus === 'Active') {
        breakdown.verification += 15;
    } else if (workerData.verificationStatus === 'Pending Verification') {
        breakdown.verification += 5;
    }
    
    if (workerData.idDocumentUrl) {
        breakdown.verification += 5;
    }
    
    score += breakdown.verification;

    // B. Review score: 25 points
    const avgRating = workerData.averageRating || 0;
    const totalReviews = workerData.totalReviews || 0;
    
    let reviewScore = (avgRating / 5) * 25;
    if (totalReviews < 3) {
        reviewScore = Math.min(reviewScore, 15);
    }
    breakdown.review = reviewScore;
    score += reviewScore;

    // C. Completion score: 20 points
    const metrics = workerData.trustMetrics || {};
    const completed = metrics.completedJobs || 0;
    const cancelled = metrics.cancelledJobs || 0;
    const rejected = metrics.rejectedJobs || 0;
    
    const totalAssigned = completed + cancelled + rejected;
    if (totalAssigned > 0) {
        const completionRate = completed / totalAssigned;
        breakdown.completion = completionRate * 20;
    } else {
        breakdown.completion = 10; // Default baseline for new workers
    }
    score += breakdown.completion;

    // D. Complaint score: 15 points
    const complaints = metrics.complaintCount || 0;
    if (complaints === 0) {
        breakdown.complaint = 15;
    } else if (completed > 0) {
        const ratio = complaints / completed;
        if (ratio < 0.05) breakdown.complaint = 10;
        else if (ratio < 0.15) breakdown.complaint = 5;
        else breakdown.complaint = 0;
    } else {
        breakdown.complaint = 5;
    }
    score += breakdown.complaint;

    // E. Response score: 10 points
    const responseTime = metrics.responseTimeMinutes || 60;
    if (responseTime <= 10) breakdown.response = 10;
    else if (responseTime <= 30) breakdown.response = 7;
    else if (responseTime <= 60) breakdown.response = 5;
    else breakdown.response = 2;
    score += breakdown.response;

    // F. Safety score: 10 points
    breakdown.safety = (metrics.safetyScore || 100) / 10; // Simple mapping if safetyScore is 0-100
    score += breakdown.safety;

    // Deductions
    let deductions = 0;
    if (workerData.isBlocked) {
        score = 0;
        deductions = 100;
        riskLevel = 'critical';
    } else {
        if (workerData.riskLevel === 'critical') {
            deductions += 40;
            riskLevel = 'critical';
        } else if (workerData.riskLevel === 'high') {
            deductions += 25;
            riskLevel = 'high';
        } else if (workerData.riskLevel === 'medium') {
            deductions += 10;
            riskLevel = Math.max(riskLevel === 'low' ? 1 : 2, 2) === 2 ? 'medium' : riskLevel;
        }

        const unresolvedComplaints = complaints - (metrics.resolvedComplaintCount || 0);
        if (unresolvedComplaints > 2) {
            deductions += 15;
            if (riskLevel === 'low') riskLevel = 'medium';
        }

        if (cancelled > 3 && (cancelled / Math.max(totalAssigned, 1)) > 0.3) {
            deductions += 10;
        }
    }

    breakdown.deductions = deductions;
    score -= deductions;

    // Clamp score
    const finalScore = Math.max(0, Math.min(100, Math.round(score)));

    // Re-evaluate risk level if score dropped significantly but wasn't caught by explicit risk levels
    if (finalScore < 40 && riskLevel !== 'critical') riskLevel = 'high';
    else if (finalScore < 60 && riskLevel === 'low') riskLevel = 'medium';

    return {
        trustScore: finalScore,
        breakdown,
        riskLevel
    };
};

module.exports = { calculateWorkerTrustScore };
