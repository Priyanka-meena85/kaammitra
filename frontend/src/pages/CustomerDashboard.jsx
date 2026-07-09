import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, List, AlertTriangle, User } from 'lucide-react';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('kaammitra_user') || '{"name": "Customer"}');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy">Welcome, {user.name}!</h1>
          <p className="text-text-gray">What service do you need today?</p>
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

      <div className="grid md:grid-cols-3 gap-6 mb-8">
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
