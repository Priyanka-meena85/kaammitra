import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import InstallAppPrompt from './components/InstallAppPrompt';
import { useAuth } from './context/AuthContext';
import { useSocket } from './context/SocketContext';
import toast from 'react-hot-toast';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import CustomerLayout from './layouts/CustomerLayout';
import WorkerLayout from './layouts/WorkerLayout';
import AdminLayout from './layouts/AdminLayout';

// Live Booking Toasts Component
const LiveBookingToasts = () => {
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket) return;

    socket.on('booking_status_updated', ({ status }) => {
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
import CustomerHome from './pages/customer/CustomerHome';
import CustomerNotifications from './pages/customer/CustomerNotifications';
import CustomerSearch from './pages/customer/CustomerSearch';
import CustomerCategories from './pages/customer/CustomerCategories';
import CustomerVoiceSearch from './pages/customer/CustomerVoiceSearch';
import CustomerWorkerResults from './pages/customer/CustomerWorkerResults';
import CustomerWorkerProfile from './pages/customer/CustomerWorkerProfile';
import CustomerBooking from './pages/customer/CustomerBooking';
import CustomerBookingConfirmation from './pages/customer/CustomerBookingConfirmation';
import CustomerBookingDetails from './pages/customer/CustomerBookingDetails';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerReviewWorker from './pages/customer/CustomerReviewWorker';
import CustomerMessages from './pages/customer/CustomerMessages';
import CustomerChat from './pages/customer/CustomerChat';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerPersonalInfo from './pages/customer/CustomerPersonalInfo';
import CustomerTrustedWorkers from './pages/customer/CustomerTrustedWorkers';
import CustomerSavedAddresses from './pages/customer/CustomerSavedAddresses';
import CustomerMyReviews from './pages/customer/CustomerMyReviews';
import CustomerHelpSupport from './pages/customer/CustomerHelpSupport';
import CustomerSettings from './pages/customer/CustomerSettings';

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

// AuthInterceptor component to handle session expiry and role-based root redirection
const AuthInterceptor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  useEffect(() => {
    // If logged in and at a public auth or root path, redirect to their specific app dashboard
    if (user && ['/', '/login', '/register', '/worker-register', '/notifications'].includes(location.pathname)) {
      if (location.pathname === '/notifications') {
        if (user.role === 'customer') navigate('/customer/notifications', { replace: true });
        else if (user.role === 'worker') navigate('/worker/notifications', { replace: true });
        else if (user.role === 'admin') navigate('/admin/notifications', { replace: true });
      } else {
        if (user.role === 'customer') navigate('/customer', { replace: true });
        else if (user.role === 'worker') navigate('/worker/dashboard', { replace: true });
        else if (user.role === 'admin') navigate('/admin', { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

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
        <Toaster position="top-center" />
        
        <Routes>
          {/* Public App */}
          <Route element={<PublicLayout />}>
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
            
            {/* Workers & Booking (Public facing discovery) */}
            <Route path="/workers" element={<Workers />} />
            <Route path="/worker/:id" element={<WorkerProfile />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/area-launch" element={<AreaLaunch />} />
            <Route path="/callback-request" element={<CallbackRequest />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/worker-onboarding" element={<WorkerOnboarding />} />
          </Route>

          {/* Consumer App */}
          <Route path="/customer" element={<ProtectedRoute roleRequired="customer"><CustomerLayout /></ProtectedRoute>}>
            <Route index element={<CustomerHome />} />
            <Route path="notifications" element={<CustomerNotifications />} />
            
            <Route path="search" element={<CustomerSearch />} />
            <Route path="search/categories" element={<CustomerCategories />} />
            <Route path="search/voice" element={<CustomerVoiceSearch />} />
            <Route path="search/results" element={<CustomerWorkerResults />} />
            <Route path="search/worker/:workerId" element={<CustomerWorkerProfile />} />
            
            <Route path="booking/new/:workerId" element={<CustomerBooking />} />
            <Route path="booking/confirm" element={<CustomerBookingConfirmation />} />
            
            <Route path="bookings" element={<CustomerBookings />} />
            <Route path="bookings/:bookingId" element={<CustomerBookingDetails />} />
            <Route path="bookings/:bookingId/review" element={<CustomerReviewWorker />} />
            
            <Route path="messages" element={<CustomerMessages />} />
            <Route path="messages/:conversationId" element={<CustomerChat />} />
            
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="profile/personal" element={<CustomerPersonalInfo />} />
            <Route path="profile/trusted-workers" element={<CustomerTrustedWorkers />} />
            <Route path="profile/addresses" element={<CustomerSavedAddresses />} />
            <Route path="profile/reviews" element={<CustomerMyReviews />} />
            <Route path="profile/help" element={<CustomerHelpSupport />} />
            <Route path="profile/settings" element={<CustomerSettings />} />
          </Route>

          {/* Worker App */}
          <Route path="/worker" element={<ProtectedRoute roleRequired="worker"><WorkerLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<WorkerDashboard />} />
            <Route path="wallet" element={<WorkerWallet />} />
            <Route path="chat/:workerId" element={<Chat />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="notification-settings" element={<NotificationSettings />} />
          </Route>

          {/* Admin App */}
          <Route path="/admin" element={<ProtectedRoute roleRequired="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="trust-safety" element={<AdminTrustSafety />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="notification-settings" element={<NotificationSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
