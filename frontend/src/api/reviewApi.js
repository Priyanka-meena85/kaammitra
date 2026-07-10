import api from '../utils/api';

export const createReview = (data) => {
    return api.post('/reviews', data);
};

export const getWorkerReviews = (workerId, params) => {
    return api.get(`/reviews/worker/${workerId}`, { params });
};

export const reportReview = (id) => {
    return api.patch(`/reviews/${id}/report`);
};

export const getAdminReviews = (params) => {
    return api.get('/reviews/admin/all', { params });
};

export const moderateReview = (id, data) => {
    return api.patch(`/reviews/admin/${id}/moderate`, data);
};
