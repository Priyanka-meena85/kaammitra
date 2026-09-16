import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, MapPin, Calendar, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

const CustomerBookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingId = location.state?.bookingId;

  useEffect(() => {
    // If no booking ID, shouldn't be here, redirect home.
    if (!bookingId) {
      navigate('/customer');
      return;
    }

    const end = Date.now() + 1.5 * 1000;
    const colors = ['#10b981', '#3b82f6']; // Emerald & Blue

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  }, [bookingId, navigate]);

  if (!bookingId) return null;

  return (
    <div className="bg-emerald-600 min-h-screen flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <CheckCircle size={64} className="text-white" strokeWidth={1.5} />
      </div>
      
      <h1 className="text-3xl font-black mb-2">Booking Confirmed!</h1>
      <p className="text-emerald-100 text-lg mb-10">
        Booking #{bookingId.substring(bookingId.length - 6).toUpperCase()} has been placed.
      </p>
      
      <div className="w-full max-w-sm space-y-3">
        <button 
          onClick={() => navigate(`/customer/bookings/${bookingId}`)}
          className="block w-full bg-white text-emerald-600 font-bold py-4 rounded-xl shadow-lg transition hover:bg-emerald-50 text-lg"
        >
          View Booking
        </button>
        <button 
          onClick={() => navigate('/customer')}
          className="block w-full bg-transparent border-2 border-white/30 text-white font-bold py-4 rounded-xl transition hover:bg-white/10"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default CustomerBookingConfirmation;
