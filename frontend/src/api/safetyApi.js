import api from '../utils/api';

export const createSafetyReport = (data) => {
    return api.post('/safety/report', data);
};

export const getMySafetyReports = () => {
    return api.get('/safety/my-reports');
};

export const getAdminSafetyReports = (params) => {
    return api.get('/safety/admin/reports', { params });
};

export const updateSafetyReport = (id, data) => {
    return api.patch(`/safety/admin/reports/${id}`, data);
};
