/**
 * Generates a date range filter based on query parameters.
 * Defaults to the last 30 days if no dates are provided.
 */
exports.getDateRange = (query = {}) => {
    const { startDate, endDate } = query;
    let start = new Date();
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
  
    let end = new Date();
    end.setHours(23, 59, 59, 999);
  
    if (startDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
    }
    
    if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }
  
    // Max 1 year range logic
    const oneYear = 1000 * 60 * 60 * 24 * 365;
    if (end.getTime() - start.getTime() > oneYear) {
      throw new Error("Date range cannot exceed 1 year.");
    }
  
    if (start.getTime() > end.getTime()) {
      throw new Error("Start date must be before end date.");
    }
  
    return { start, end };
};
  
/**
 * Gets the equivalent previous period for comparison.
 * e.g., if current is last 30 days, previous is 30 days before that.
 */
exports.getPreviousPeriod = (startDate, endDate) => {
    const duration = endDate.getTime() - startDate.getTime();
    
    const prevEnd = new Date(startDate.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration);
    
    return { prevStart, prevEnd };
};
  
/**
 * Builds a MongoDB filter object for a specific date field.
 */
exports.buildDateFilter = (fieldName = 'createdAt', startDate, endDate) => {
    return {
        [fieldName]: {
            $gte: startDate,
            $lte: endDate
        }
    };
};
