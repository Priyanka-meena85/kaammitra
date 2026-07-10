/**
 * Calculate a smart matching score for a worker based on search parameters.
 * @param {Object} worker - The worker object from DB.
 * @param {Object} searchParams - The search parameters { service, city, area, latitude, longitude, urgency, maxBudget, preferredTime }
 * @returns {Object} { score, breakdown, matchReason }
 */
exports.calculateWorkerScore = (worker, searchParams = {}) => {
    let score = 0;
    const breakdown = {
        service: 0,
        location: 0,
        availability: 0,
        verification: 0,
        rating: 0,
        completion: 0,
        responseTime: 0,
        emergencyBoost: 0,
        budget: 0,
        subscriptionBoost: 0,
        collaborativeBoost: 0,
        recencyBoost: 0
    };
    let primaryReason = '';

    // Blocked workers get 0 immediately
    if (worker.isBlocked || worker.riskLevel === 'critical') {
        return { score: 0, breakdown, matchReason: 'Blocked or high-risk worker' };
    }

    // Safely parse values
    const wServices = Array.isArray(worker.services) ? worker.services.map(s => s.toLowerCase()) : [];
    const wSkills = Array.isArray(worker.skills) ? worker.skills.map(s => s.toLowerCase()) : [];
    const avgRating = worker.averageRating || 0;
    const compJobs = worker.completedJobs || 0;
    const respTime = worker.responseTimeMinutes || worker.responseTime || 60;
    const expCharge = worker.expectedCharge || null;
    const isAvail = worker.isAvailable || false;
    const isVerif = worker.isVerified || false;
    const trustScore = worker.trustScore || 50;

    // A. Service match: 25 points
    if (searchParams.service) {
        const queryService = searchParams.service.toLowerCase();
        if (wServices.includes(queryService)) {
            breakdown.service = 25;
        } else if (wSkills.includes(queryService)) {
            breakdown.service = 15;
        }
    } else {
        breakdown.service = 25; // If no service filter, assume matching for ranking
    }
    score += breakdown.service;

    // B. Location match: 20 points
    if (searchParams.area && worker.area && searchParams.area.toLowerCase() === worker.area.toLowerCase()) {
        breakdown.location = 20;
        primaryReason = 'Available in your area';
    } else if (searchParams.city && worker.city && searchParams.city.toLowerCase() === worker.city.toLowerCase()) {
        breakdown.location = 12;
    } else if (searchParams.latitude && searchParams.longitude && worker.location && worker.location.coordinates) {
        // Distance calculation can be refined, just rough points if coordinates exist and nearby
        // This relies on MongoDB geo queries for exact distance, but for scoring here we just give points if they have coords
        breakdown.location = 15;
    }
    score += breakdown.location;

    // C. Availability: 15 points
    if (isAvail) {
        breakdown.availability = 15;
        // Check preferredTime if provided (e.g., "14:30")
        if (searchParams.preferredTime) {
            // Simplified working hours check (e.g., "09:00" to "18:00")
            const start = worker.workingHoursStart || "09:00";
            const end = worker.workingHoursEnd || "18:00";
            if (searchParams.preferredTime >= start && searchParams.preferredTime <= end) {
                // Within hours
            } else {
                breakdown.availability = 5; // Penalty for outside hours but generally available
            }
        }
    }
    score += breakdown.availability;

    // D. Verification and trust: 15 points
    if (isVerif) {
        breakdown.verification = 5;
    }
    
    // Add trustScore factor (max 10 points)
    if (trustScore >= 85) {
        breakdown.verification += 10;
        if (!primaryReason) primaryReason = 'Trusted Pro with high completion rate';
    } else if (trustScore >= 70) {
        breakdown.verification += 7;
        if (!primaryReason) primaryReason = 'Verified worker with low complaint rate';
    } else if (trustScore >= 50) {
        breakdown.verification += 3;
    } else {
        breakdown.verification -= 10;
    }
    
    if (worker.riskLevel === 'high') {
        breakdown.verification -= 30; // Rank very low
    }
    
    score += breakdown.verification;

    // E. Rating: 10 points
    if (avgRating >= 4.5) breakdown.rating = 10;
    else if (avgRating >= 4.0) breakdown.rating = 8;
    else if (avgRating >= 3.5) breakdown.rating = 5;
    else if (avgRating > 0) breakdown.rating = 2;
    else breakdown.rating = 3; // No rating
    score += breakdown.rating;

    // F. Job completion: 10 points
    if (compJobs > 50) breakdown.completion = 10;
    else if (compJobs > 10) breakdown.completion = 6;
    else breakdown.completion = 2;
    score += breakdown.completion;

    // G. Response time: 5 points
    if (respTime <= 10) breakdown.responseTime = 5;
    else if (respTime <= 30) breakdown.responseTime = 3;
    else if (respTime <= 60) breakdown.responseTime = 2;
    else breakdown.responseTime = 1;
    score += breakdown.responseTime;

    // H. Emergency boost: 15 points
    if (searchParams.urgency === 'emergency' && worker.emergencyAvailable) {
        breakdown.emergencyBoost = 15;
        primaryReason = 'Emergency available';
    }
    score += breakdown.emergencyBoost;

    // I. Budget match: +/- 5 points
    if (searchParams.maxBudget && expCharge) {
        if (expCharge <= searchParams.maxBudget) {
            breakdown.budget = 5;
            if (!primaryReason) primaryReason = 'Affordable price';
        } else {
            breakdown.budget = -5;
        }
    }
    score += breakdown.budget;

    // J. Subscription Boost: 20 points
    if (worker.isSubscribed) {
        breakdown.subscriptionBoost = 20;
        primaryReason = 'Premium Featured Worker';
    }
    score += breakdown.subscriptionBoost;

    // K. Collaborative Filtering Boost: 25 points
    if (searchParams.pastBookedWorkers && searchParams.pastBookedWorkers.includes(worker._id.toString())) {
        breakdown.collaborativeBoost = 25;
        primaryReason = 'You successfully booked this worker before';
    }
    score += breakdown.collaborativeBoost;

    // L. Recency Boost: 5 points
    if (worker.updatedAt) {
        const hoursSinceUpdate = (new Date() - new Date(worker.updatedAt)) / (1000 * 60 * 60);
        if (hoursSinceUpdate <= 48) {
            breakdown.recencyBoost = 5;
            if (!primaryReason) primaryReason = 'Recently active and ready to work';
        }
    }
    score += breakdown.recencyBoost;

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Refine dynamic reason if none
    if (!primaryReason) {
        if (breakdown.location >= 15 && breakdown.availability >= 10) {
            primaryReason = 'Best match because this worker is available and in your area.';
        } else if (breakdown.rating >= 8) {
            primaryReason = 'Top rated worker in your area';
        } else {
            primaryReason = 'Recommended match';
        }
    }

    return {
        score,
        breakdown,
        matchReason: primaryReason
    };
};
