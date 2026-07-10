import api from '../utils/api';

export const getAuditLogs = (params) => {
    return api.get('/admin/audit-logs', { params });
};

export const getAuditLogDetails = (id) => {
    return api.get(`/admin/audit-logs/${id}`);
};
