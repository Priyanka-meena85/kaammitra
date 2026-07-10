import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, List, AlertTriangle, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({ totalBookings: 0, pending: 0, active: 0 });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  if (loading) return <div className="text-center py-20 text-text-gray font-medium">Loading dashboard...</div>;
  if (apiError) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-orange-50 rounded-3xl shadow-sm border border-orange-200 p-12 text-center">
        <AlertTriangle size={64} className="mx-auto text-orange-400 mb-4" />
        <h2 className="text-2xl font-bold text-orange-900 mb-2">{apiError}</h2>
        <p className="text-orange-700 mb-6">Render's free tier sleeps after 15 minutes of inactivity. It takes a moment to spin back up.</p>
        <button onClick={() => window.location.reload()} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md">
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy">Welcome, {user.name}!</h1>
          <p className="text-text-gray">What service do you need today?</p>
        </div>
        <div className="flex gap-4 items-center">
          {user.reliabilityScore !== undefined && (
            <div className="hidden md:block text-right">
               <p className="text-xs text-text-gray uppercase tracking-wider font-bold">Reliability Score</p>
               <p className={`font-bold text-lg ${user.reliabilityScore < 50 ? 'text-orange-600' : 'text-green-600'}`}>{user.reliabilityScore}/100</p>
            </div>
          )}
          <button 
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="bg-bg-soft-blue hover:bg-border-gray text-text-gray px-4 py-2 rounded-lg font-medium"
          >
            Logout
          </button>
        </div>
      </div>
      
      {user.riskLevel === 'high' || user.riskLevel === 'critical' ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl mb-8 flex items-start gap-3">
           <AlertTriangle className="text-red-600 mt-0.5 shrink-0" size={24} />
           <div>
              <p className="font-bold text-red-800">Account Warning</p>
              <p className="text-sm text-red-700">Your reliability score is low due to frequent cancellations or disputes. Consistent low scores may restrict your access to booking top-rated workers.</p>
           </div>
        </div>
      ) : null}

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => navigate('/workers')}
          className="bg-primary text-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
        >
          <Search size={32} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">Find a Worker</h2>
          <p className="text-blue-100">Search for verified professionals near you.</p>
        </div>
        
        <div 
          onClick={() => navigate('/my-bookings')}
          className="bg-accent-green text-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
        >
          <List size={32} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">My Bookings</h2>
          <p className="text-green-100">View and manage your service bookings.</p>
        </div>

        <div 
          onClick={() => navigate('/emergency')}
          className="bg-accent-orange text-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
        >
          <AlertTriangle size={32} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">Emergency Help</h2>
          <p className="text-red-100">Get immediate assistance for urgent repairs.</p>
        </div>

        <div 
          onClick={() => navigate('/notifications')}
          className="bg-blue-500 text-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
        >
          <Bell size={32} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">Notifications</h2>
          <p className="text-blue-100">View alerts and update preferences.</p>
        </div>
      </div>

      <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6">
        <h2 className="text-xl font-bold text-navy mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-text-gray">
          <p>No recent activity to show.</p>
          <button onClick={() => navigate('/services')} className="mt-4 text-primary font-bold hover:underline">Explore Services</button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
