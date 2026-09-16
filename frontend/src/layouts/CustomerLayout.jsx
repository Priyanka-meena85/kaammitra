import React from 'react';
import { Outlet } from 'react-router-dom';
import CustomerBottomNav from '../components/customer/CustomerBottomNav';
import CustomerTopNav from '../components/customer/CustomerTopNav';

const CustomerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Top Navigation for Desktop */}
      <CustomerTopNav />

      {/* Main Content Area - Responsive */}
      <main className="flex-grow w-full max-w-7xl mx-auto bg-slate-50 relative pb-20 md:pb-8 shadow-sm min-h-screen overflow-x-hidden md:px-8">
        <Outlet />
      </main>
      
      {/* Bottom Navigation for Mobile */}
      <CustomerBottomNav />
    </div>
  );
};

export default CustomerLayout;
