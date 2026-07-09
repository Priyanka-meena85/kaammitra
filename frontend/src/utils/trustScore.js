export const calculateTrustScore = (worker) => {
  let score = 0;

  // Baseline if verified
  if (worker.isVerified) score += 25;

  // Rating contribution (up to 25 points)
  if (worker.averageRating) {
    if (worker.averageRating >= 4.5) score += 25;
    else if (worker.averageRating >= 4.0) score += 20;
    else if (worker.averageRating >= 3.0) score += 10;
  }

  // Completed jobs contribution (up to 20 points)
  if (worker.completedJobs) {
    if (worker.completedJobs > 50) score += 20;
    else if (worker.completedJobs > 20) score += 15;
    else if (worker.completedJobs > 5) score += 10;
  }

  // Response time contribution (up to 15 points)
  if (worker.responseTime) {
    if (worker.responseTime.includes('hour')) score += 15; // e.g. "1 hour"
    else if (worker.responseTime.includes('day')) score += 5; 
  }

  // Complaints penalty
  if (worker.complaintsCount === 0) {
    score += 15;
  } else if (worker.complaintsCount > 0 && worker.complaintsCount <= 2) {
    score += 5; // Slight addition for still being mostly good
  } else if (worker.complaintsCount > 5) {
    score -= 20; // Penalty
  }

  // Profile completeness (up to 10 points - assumed based on photo & docs)
  if (worker.profilePhoto) score += 5;
  if (worker.verificationDocument) score += 5;

  // Normalize score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return score;
};

export const getTrustBadge = (score) => {
  if (score >= 80) return { label: 'High Trust', color: 'bg-green-100 text-green-800 border-green-200' };
  if (score >= 50) return { label: 'Medium Trust', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
  return { label: 'New Worker', color: 'bg-gray-100 text-gray-800 border-gray-200' };
};
