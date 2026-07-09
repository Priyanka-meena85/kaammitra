import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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
import HowItWorks from './pages/HowItWorks';
import Chat from './pages/Chat';
import CustomerDashboard from './pages/CustomerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-bg-warm">
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
