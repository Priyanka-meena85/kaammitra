import React, { useState, useEffect } from 'react';
import { notificationApi } from '../api/notificationApi';
import { useNotification } from '../context/NotificationContext';
import { FaMobileAlt, FaDesktop, FaEnvelope, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';

const NotificationSettings = () => {
  const [preferences, setPreferences] = useState({
    bookingUpdates: { inApp: true, push: true, sms: false, email: false },
    promotions: { inApp: true, push: false, sms: false, email: false },
    systemAlerts: { inApp: true, push: true, sms: false, email: true },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { pushSupported, pushEnabled, requestPushPermission } = useNotification();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await notificationApi.getNotificationPreferences();
      if (res.success && res.data) {
        setPreferences(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (category, channel) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel]
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await notificationApi.updateNotificationPreferences(preferences);
      if (res.success) {
        toast.success('Preferences saved successfully!');
      }
    } catch (err) {
      toast.error('Failed to save preferences');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEnablePush = async () => {
    const success = await requestPushPermission();
    if (success) {
      toast.success('Push notifications enabled!');
    } else {
      toast.error('Failed to enable push notifications');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  const CategorySettings = ({ title, category, description }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border mb-4">
      <div className="mb-4">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={preferences[category].inApp} 
            onChange={() => handleToggle(category, 'inApp')}
            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <FaDesktop className="text-gray-400" /> In-App
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={preferences[category].push} 
            onChange={() => handleToggle(category, 'push')}
            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
            disabled={!pushEnabled}
          />
          <div className={`flex items-center gap-1.5 text-sm font-medium ${!pushEnabled ? 'text-gray-400' : 'text-gray-700'}`}>
            <FaMobileAlt className={!pushEnabled ? 'text-gray-300' : 'text-gray-400'} /> Push Alert
          </div>
        </label>
        
        {/* SMS and Email placeholders */}
        <label className="flex items-center gap-3 cursor-not-allowed opacity-50">
          <input type="checkbox" checked={preferences[category].sms} disabled className="w-4 h-4 rounded" />
          <div className="flex items-center gap-1.5 text-sm font-medium"><FaMobileAlt /> SMS</div>
        </label>
        
        <label className="flex items-center gap-3 cursor-not-allowed opacity-50">
          <input type="checkbox" checked={preferences[category].email} disabled className="w-4 h-4 rounded" />
          <div className="flex items-center gap-1.5 text-sm font-medium"><FaEnvelope /> Email</div>
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Notification Settings</h1>
      
      {pushSupported && !pushEnabled && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h3 className="font-bold text-blue-800">Enable Push Notifications</h3>
            <p className="text-sm text-blue-600">Get alerts even when the app is closed!</p>
          </div>
          <button 
            onClick={handleEnablePush}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Enable Now
          </button>
        </div>
      )}

      <CategorySettings 
        title="Booking Updates" 
        category="bookingUpdates" 
        description="Alerts for booking requests, acceptances, and completions."
      />
      
      <CategorySettings 
        title="System Alerts" 
        category="systemAlerts" 
        description="Important account security and verification updates."
      />
      
      <CategorySettings 
        title="Promotions" 
        category="promotions" 
        description="Offers, discounts, and new feature announcements."
      />

      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-md disabled:opacity-70"
        >
          {saving ? 'Saving...' : <><FaSave /> Save Preferences</>}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
