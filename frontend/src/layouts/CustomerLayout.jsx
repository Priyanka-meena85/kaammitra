import React from 'react';
import { Outlet } from 'react-router-dom';
import CustomerNavbar from '../components/navigation/CustomerNavbar';
import Footer from '../components/Footer';

const CustomerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-warm">
      <CustomerNavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
