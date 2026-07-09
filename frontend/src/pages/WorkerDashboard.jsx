import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, IndianRupee, Star, Settings, User } from 'lucide-react';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('kaammitra_user') || '{"name": "Worker"}');
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy">Welcome, {user.name}!</h1>
          <p className="text-text-gray">Manage your profile and jobs.</p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('kaammitra_user');
            navigate('/login');
          }}
          className="bg-bg-soft-blue hover:bg-border-gray text-text-gray px-4 py-2 rounded-lg font-medium"
        >
          Logout
        </button>
      </div>

      {/* Availability Toggle */}
      <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6 mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-navy">Current Status</h2>
          <p className="text-sm text-text-gray">Turn off if you are busy or on leave.</p>
        </div>
        <button 
          onClick={() => setIsAvailable(!isAvailable)}
          className={`px-6 py-3 rounded-full font-bold shadow-md transition-colors ${isAvailable ? 'bg-accent-green hover:bg-accent-green-hover text-white' : 'bg-accent-orange hover:bg-accent-orange text-white'}`}
        >
          {isAvailable ? 'Available for Jobs' : 'Currently Busy'}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6 flex items-center gap-4">
          <div className="bg-bg-soft-blue text-primary p-4 rounded-xl">
            <Briefcase size={28} />
          </div>
          <div>
            <p className="text-text-gray text-sm font-medium">Completed Jobs</p>
            <p className="text-2xl font-bold text-navy">0</p>
          </div>
        </div>
        <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6 flex items-center gap-4">
          <div className="bg-accent-green/20 text-accent-green p-4 rounded-xl">
            <IndianRupee size={28} />
          </div>
          <div>
            <p className="text-text-gray text-sm font-medium">Total Earnings</p>
            <p className="text-2xl font-bold text-navy">₹0</p>
          </div>
        </div>
        <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6 flex items-center gap-4">
          <div className="bg-amber-100 text-amber-600 p-4 rounded-xl">
            <Star size={28} />
          </div>
          <div>
            <p className="text-text-gray text-sm font-medium">Average Rating</p>
            <p className="text-2xl font-bold text-navy">New</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6">
          <h2 className="text-xl font-bold text-navy mb-4">New Job Requests</h2>
          <div className="text-center py-8 text-text-gray border-2 border-dashed border-border-gray rounded-xl">
            <p>No new requests right now.</p>
            <p className="text-sm mt-2">Make sure your status is set to 'Available'.</p>
          </div>
        </div>
        <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6">
          <h2 className="text-xl font-bold text-navy mb-4">Profile Completion</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-accent-green font-medium">
              <CheckCircle /> Basic Info Submitted
            </div>
            <div className="flex items-center gap-2 text-yellow-600 font-medium">
              <Settings /> Pending ID Verification
            </div>
            <div className="flex items-center gap-2 text-border-gray font-medium">
              <User /> Add Profile Photo (Optional)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple CheckCircle Icon for this component
const CheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

export default WorkerDashboard;
