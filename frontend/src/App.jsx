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

    socket.on('booking_status_updated', ({ status }) => {
      // react-hot-toast has no `toast.info` — calling it threw a TypeError on
      // every worker update and on Rejected/Cancelled/In Progress for customers.
      if (user?.role === 'customer') {
        if (status === 'Accepted') toast.success('Your booking was accepted!');
        else if (status === 'On the Way') toast.success('Worker is on the way!');
        else if (status === 'Completed') toast.success('Job completed!');
        else toast(`Booking status updated to ${status}`);
      } else if (user?.role === 'worker') {
        toast(`Booking status updated to ${status}`);
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
import WorkerWallet from './pages/WorkerWallet';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import { Terms, Privacy, Refunds } from './pages/Legal';
import ProtectedRoute from './components/ProtectedRoute';
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
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Legal */}
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refund-policy" element={<Refunds />} />
              
              {/* Workers & Booking */}
              <Route path="/workers" element={<Workers />} />
              <Route path="/worker/:id" element={<WorkerProfile />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/area-launch" element={<AreaLaunch />} />
              <Route path="/callback-request" element={<CallbackRequest />} />
              <Route path="/pricing" element={<Pricing />} />
              {/* Public on purpose: this is the worker recruitment funnel. */}
              <Route path="/worker-onboarding" element={<WorkerOnboarding />} />

              {/* Customer — signed in */}
              <Route path="/booking" element={<ProtectedRoute roleRequired="customer"><BookingForm /></ProtectedRoute>} />
              <Route path="/booking/:workerId" element={<ProtectedRoute roleRequired="customer"><BookingForm /></ProtectedRoute>} />
              <Route path="/my-bookings" element={<ProtectedRoute roleRequired="customer"><MyBookings /></ProtectedRoute>} />
              <Route path="/customer-dashboard" element={<ProtectedRoute roleRequired="customer"><CustomerDashboard /></ProtectedRoute>} />

              {/* Worker — signed in */}
              <Route path="/worker-dashboard" element={<ProtectedRoute roleRequired="worker"><WorkerDashboard /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute roleRequired="worker"><WorkerWallet /></ProtectedRoute>} />

              {/* Any signed-in user */}
              <Route path="/chat/:workerId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/notification-settings" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute roleRequired="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute roleRequired="admin"><AdminAnalytics /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute roleRequired="admin"><AdminReports /></ProtectedRoute>} />
              <Route path="/admin/audit-logs" element={<ProtectedRoute roleRequired="admin"><AdminAuditLogs /></ProtectedRoute>} />
              <Route path="/admin/trust-safety" element={<ProtectedRoute roleRequired="admin"><AdminTrustSafety /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
