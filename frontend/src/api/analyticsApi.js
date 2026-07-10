import api from '../utils/api';

export const getDashboardSummary = (params) => {
    return api.get('/admin/analytics/summary', { params });
};

export const getBookingAnalytics = (params) => {
    return api.get('/admin/analytics/bookings', { params });
};

export const getRevenueAnalytics = (params) => {
    return api.get('/admin/analytics/revenue', { params });
};

export const getWorkerAnalytics = (params) => {
    return api.get('/admin/analytics/workers', { params });
};

export const getComplaintAnalytics = (params) => {
    return api.get('/admin/analytics/complaints', { params });
};
