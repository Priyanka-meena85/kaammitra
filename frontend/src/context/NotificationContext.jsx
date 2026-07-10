import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { notificationApi } from '../api/notificationApi';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationApi.getUnreadCount();
      if (res.success) {
        setUnreadCount(res.count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [user]);

  const fetchNotifications = useCallback(async (page = 1) => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications({ page });
      if (res.success) {
        if (page === 1) {
          setNotifications(res.data);
        } else {
          setNotifications(prev => [...prev, ...res.data]);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markRead = async (id) => {
    try {
      const res = await notificationApi.markNotificationRead(id);
      if (res.success) {
        setNotifications(prev => 
          prev.map(n => n._id === id ? { ...n, status: 'read' } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await notificationApi.markAllNotificationsRead();
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const addRealtimeNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const checkPushSupport = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushSupported(false);
      return;
    }
    setPushSupported(true);
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    setPushEnabled(!!subscription);
  }, []);

  const requestPushPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
            console.warn('VAPID key not configured. Push subscription skipped.');
            return false;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });

        // Send to backend
        await notificationApi.subscribePush({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
            auth: arrayBufferToBase64(subscription.getKey('auth'))
          },
          userAgent: navigator.userAgent
        });
        
        setPushEnabled(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Push permission error:', err);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchNotifications();
      checkPushSupport();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchUnreadCount, fetchNotifications, checkPushSupport]);

  useEffect(() => {
    if (socket && user) {
      socket.on('notification:new', addRealtimeNotification);
      return () => {
        socket.off('notification:new', addRealtimeNotification);
      };
    }
  }, [socket, user, addRealtimeNotification]);

  // Fallback Polling if socket doesn't exist
  useEffect(() => {
    if (!socket && user) {
      const interval = setInterval(fetchUnreadCount, 30000); // 30s
      return () => clearInterval(interval);
    }
  }, [socket, user, fetchUnreadCount]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      pushSupported,
      pushEnabled,
      fetchNotifications,
      fetchUnreadCount,
      markRead,
      markAllRead,
      requestPushPermission
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Utility functions for VAPID
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
