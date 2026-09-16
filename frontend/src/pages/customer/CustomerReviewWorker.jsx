import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Loader2 } from 'lucide-react';
import { User } from 'lucide-react'; // Placeholder
import { getMyBookings, updateBookingStatus } from '../../api/customerApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CustomerReviewWorker = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        if (!user || !user.id) return;
        const res = await getMyBookings(user.id);
        if (res.success && res.data) {
          const found = res.data.find(b => b._id === bookingId);
          if (found) {
            setBooking(found);
          } else {
            toast.error("Booking not found");
            navigate('/customer/bookings');
          }
        }
      } catch (err) {
        console.error("Failed to load booking details", err);
        if (!err.isWakingUp) toast.error("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooking();
  }, [bookingId, user, navigate]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    try {
      setSubmitting(true);
      // We assume updating status to 'Rated' is the way to complete this for now.
      // In a real app, there would be a separate POST /reviews endpoint.
      const res = await updateBookingStatus(bookingId, 'Rated');
      if (res.success) {
        toast.success("Thank you for your feedback!");
        navigate('/customer/bookings');
      } else {
        toast.error("Failed to submit review");
      }
    } catch (err) {
      console.error("Failed to submit review", err);
      if (!err.isWakingUp) toast.error("Failed to submit review. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center pb-24 text-slate-400">
        <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
        <p className="font-medium">Loading...</p>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="bg-slate-50 min-h-screen pb-24 flex flex-col items-center justify-center md:py-10">
      <div className="w-full max-w-xl bg-white md:rounded-3xl md:shadow-xl md:border md:border-slate-100 flex flex-col h-screen md:h-auto md:min-h-[600px] relative">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-slate-100 shadow-sm sticky top-0 z-10 flex items-center gap-3 md:rounded-t-3xl">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Rate Service</h1>
      </div>
      
      <div className="p-4 pt-8 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-sm border-4 border-white">
          <User size={40} />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800">How was {booking.workerId?.name || 'the worker'}?</h2>
        <p className="text-slate-500 font-medium mt-1 mb-8">{booking.serviceId?.name || 'Service'} • {new Date(booking.date).toLocaleDateString()}</p>
        
        <div className="flex gap-2 mb-10">
          {[1, 2, 3, 4, 5].map(star => (
            <button 
              key={star}
              onClick={() => setRating(star)}
              className="p-1 transition-transform active:scale-90"
            >
              <Star 
                size={48} 
                className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-100"} 
              />
            </button>
          ))}
        </div>
        
        <div className="w-full max-w-sm">
          <label className="block text-left text-sm font-bold text-slate-700 mb-2">Write a review (optional)</label>
          <textarea 
            rows="4" 
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell us what you liked or what could be better..."
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition shadow-sm resize-none"
          ></textarea>
        </div>
      </div>
      
      {/* Bottom Sticky Action */}
      <div className="fixed md:absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] md:shadow-none z-50 md:rounded-b-3xl pb-safe md:pb-6">
        <button 
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className={`w-full font-bold text-lg py-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 ${
            rating > 0 && !submitting
              ? 'bg-orange-500 hover:bg-blue-700 text-white' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {submitting ? <><Loader2 size={20} className="animate-spin" /> Submitting...</> : 'Submit Review'}
        </button>
      </div>
      </div>
    </div>
  );
};

export default CustomerReviewWorker;
