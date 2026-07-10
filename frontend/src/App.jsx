import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import InstallAppPrompt from './components/InstallAppPrompt';
import { useAuth } from './context/AuthContext';
import { useSocket } from './context/SocketContext';
import toast from 'react-hot-toast';

// Live Booking Toasts Component
const LiveBookingToasts = () => {
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket) return;

    socket.on('booking_status_updated', ({ bookingId, status }) => {
      if (user?.role === 'customer') {
        if (status === 'Accepted') toast.success('Your booking was accepted!');
        else if (status === 'On the Way') toast.success('Worker is on the way!');
        else if (status === 'Completed') toast.success('Job completed!');
        else toast.info(`Booking status updated to ${status}`);
      } else if (user?.role === 'worker') {
        toast.info(`Booking status updated to ${status}`);
      }
    });

    socket.on('new_booking_received', () => {
      toast.success('New booking received!', { duration: 5000 });
    });

    return () => {
      socket.off('booking_status_updated');
      socket.off('new_booking_received');
    };
  }, [socket, user]);

  return null;
};

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
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminReports from './pages/admin/AdminReports';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminTrustSafety from './pages/admin/AdminTrustSafety';
import Notifications from './pages/Notifications';
import NotificationSettings from './pages/NotificationSettings';
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
    <HelmetProvider>
      <Router>
        <AuthInterceptor />
        <LiveBookingToasts />
        <InstallAppPrompt />
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
              <Route path="/booking" element={<BookingForm />} />
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
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
              <Route path="/admin/trust-safety" element={<AdminTrustSafety />} />

              {/* Notifications */}
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/notification-settings" element={<NotificationSettings />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
