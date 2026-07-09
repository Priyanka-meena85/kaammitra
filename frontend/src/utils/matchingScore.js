export const calculateMatchingScore = (worker, userLocation = null, isEmergency = false) => {
    let score = 0;

    // Availability
    if (worker.isAvailable) score += 25;
    if (isEmergency && worker.emergencyAvailable) score += 20;

    // Verification
    if (worker.verificationStatus === 'Verified') score += 20;
    if (worker.phoneVerified) score += 5;
    if (worker.idVerified) score += 5;

    // Rating
    if (worker.averageRating >= 4.5) score += 15;
    else if (worker.averageRating >= 4.0) score += 10;
    else if (worker.averageRating >= 3.5) score += 5;

    // Distance
    if (userLocation && worker.location && worker.location.coordinates) {
        const dist = calculateDistance(
            userLocation.lat, userLocation.lng,
            worker.location.coordinates[1], worker.location.coordinates[0]
        );
        if (dist <= 2) score += 20;
        else if (dist <= 5) score += 15;
        else if (dist <= 10) score += 5;
    }

    // Response time
    if (worker.responseTime && worker.responseTime <= 30) score += 10;
    else if (worker.responseTime && worker.responseTime <= 60) score += 5;

    // Complaints
    if (worker.complaintsCount === 0) score += 10;
    else if (worker.complaintsCount > 3) score -= 20;

    return Math.max(0, Math.min(100, score)); // clamp between 0 and 100
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

export const getMatchingBadge = (worker, score) => {
    if (score >= 85) return 'Best Match';
    if (worker.responseTime <= 30) return 'Fast Response';
    if (score >= 70 && worker.verificationStatus === 'Verified') return 'High Trust';
    return null;
};
