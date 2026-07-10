import api from '../utils/api';

export const notificationApi = {
  getNotifications: async (params = {}) => {
    const { data } = await api.get('/notifications', { params });
    return data;
  },

  getUnreadCount: async () => {
    const { data } = await api.get('/notifications/unread-count');
    return data;
  },

  markNotificationRead: async (id) => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },

  markAllNotificationsRead: async () => {
    const { data } = await api.patch('/notifications/read-all');
    return data;
  },

  archiveNotification: async (id) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },

  getNotificationPreferences: async () => {
    const { data } = await api.get('/notifications/preferences');
    return data;
  },

  updateNotificationPreferences: async (preferences) => {
    const { data } = await api.patch('/notifications/preferences', { preferences });
    return data;
  },

  subscribePush: async (subscriptionData) => {
    const { data } = await api.post('/notifications/push/subscribe', subscriptionData);
    return data;
  },

  unsubscribePush: async (endpoint) => {
    const { data } = await api.delete('/notifications/push/unsubscribe', { data: { endpoint } });
    return data;
  },
  
  getAdminNotifications: async (params = {}) => {
    const { data } = await api.get('/notifications/admin', { params });
    return data;
  }
};
