import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';
import toast from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import Workers from './pages/Workers';
import WorkerProfile from './pages/WorkerProfile';
import BookingForm from './pages/BookingForm';
import MyBookings from './pages/MyBookings';

import Services from './pages/Services';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerRegister from './pages/WorkerRegister';
import Emergency from './pages/Emergency';
import AreaLaunch from './pages/AreaLaunch';
import HowItWorks from './pages/HowItWorks';
import Chat from './pages/Chat';
import CallbackRequest from './pages/CallbackRequest';
import Pricing from './pages/Pricing';
import WorkerOnboarding from './pages/WorkerOnboarding';
import CustomerDashboard from './pages/CustomerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from 'react-hot-toast';

// AuthInterceptor component to handle navigation
const AuthInterceptor = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/worker-register') {
        toast.error('Session expired. Please login again.', { id: 'session-expired' });
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [navigate, logout]);

  return null;
};

function App() {
  return (
    <Router>
      <AuthInterceptor />
      <div className="flex flex-col min-h-screen bg-bg-warm">
        <Toaster position="top-center" />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            
            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/worker-register" element={<WorkerRegister />} />
            
            {/* Workers & Booking */}
            <Route path="/workers" element={<Workers />} />
            <Route path="/worker/:id" element={<WorkerProfile />} />
            <Route path="/booking/:workerId" element={<BookingForm />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/chat/:workerId" element={<Chat />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/area-launch" element={<AreaLaunch />} />
            <Route path="/callback-request" element={<CallbackRequest />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/worker-onboarding" element={<WorkerOnboarding />} />

            {/* Dashboards */}
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/worker-dashboard" element={<WorkerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
