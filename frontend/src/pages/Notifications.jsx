import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { notificationApi } from '../api/notificationApi';
import { formatDistanceToNow } from 'date-fns';
import { FaCheckDouble, FaTrash, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const { markRead, markAllRead } = useNotification();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'booking', 'payment'
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'unread') params.status = 'unread';
      else if (filter !== 'all') params.type = new RegExp(`^${filter}`);
      
      const res = await notificationApi.getNotifications(params);
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id) => {
    try {
      await notificationApi.archiveNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.status === 'unread') {
      markRead(notification._id);
      setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, status: 'read' } : n));
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border p-1">
            <FaFilter className="text-gray-400 ml-2" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm p-2 outline-none"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="booking">Bookings</option>
              <option value="payment">Payments</option>
              <option value="complaint">Complaints</option>
            </select>
          </div>
          
          <button 
            onClick={() => { markAllRead(); fetchNotifications(); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-primary rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <FaCheckDouble /> Mark All Read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border h-24"></div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
          <h3 className="text-gray-500 font-medium">No notifications found</h3>
          <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div 
              key={notification._id}
              className={`bg-white p-4 rounded-xl shadow-sm border transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group ${notification.status === 'unread' ? 'border-l-4 border-l-primary bg-blue-50/20' : ''}`}
            >
              <div 
                className="flex-grow cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold ${notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>
                    {notification.title}
                  </h3>
                  {notification.priority === 'urgent' && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">Urgent</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); handleArchive(notification._id); }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Archive"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
