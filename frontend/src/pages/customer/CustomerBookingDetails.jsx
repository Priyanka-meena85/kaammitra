import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, MessageSquare, Phone, MoreVertical, Loader2 } from 'lucide-react';
import { User } from 'lucide-react'; // Placeholder
import { getMyBookings } from '../../api/customerApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CustomerBookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        if (!user || !user.id) return;
        // Since there is no explicit /bookings/:id in customerApi yet, we'll fetch all and find
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
    
    fetchBookingDetails();
  }, [bookingId, user, navigate]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center pb-24 text-slate-400">
        <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
        <p className="font-medium">Loading booking...</p>
      </div>
    );
  }

  if (!booking) return null;

  const getStatusLevel = (status) => {
    const statusMap = {
      'Pending': 1,
      'Accepted': 2,
      'On the Way': 3,
      'In Progress': 4,
      'Completed': 5,
      'Rated': 5,
      'Cancelled': -1,
      'Rejected': -1
    };
    return statusMap[status] || 0;
  };

  const statusLvl = getStatusLevel(booking.status);
  const isCancelled = statusLvl === -1;

  return (
    <div className="bg-slate-50 min-h-screen pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-slate-100 shadow-sm sticky top-0 z-10 flex justify-between items-center md:static md:shadow-none md:border-none md:bg-transparent md:pt-8 md:px-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-800">Booking #{booking._id.substring(booking._id.length - 6).toUpperCase()}</h1>
        </div>
        <button className="text-slate-400 p-2 hover:bg-slate-100 rounded-full">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="p-4 pt-6 md:px-0">
        {/* Worker Info */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
              <User size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{booking.workerId?.name || 'Worker Assignment'}</h3>
              <p className="text-xs text-slate-500 font-medium">{booking.serviceId?.name || 'Service'} • ⭐ {booking.workerId?.averageRating || 0}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate(`/customer/messages/${booking.workerId?._id}`)}
              className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center"
            >
              <MessageSquare size={18} />
            </button>
            <a 
              href={`tel:${booking.workerId?.phone}`}
              className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center"
            >
              <Phone size={18} />
            </a>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6">Status: <span className={isCancelled ? 'text-red-500' : 'text-orange-500'}>{booking.status}</span></h3>
          
          {!isCancelled ? (
            <div className="relative border-l-2 border-orange-100 ml-3 space-y-8">
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-0 bg-white">
                  {statusLvl >= 1 ? <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50" /> : <Circle size={16} className="text-slate-300" />}
                </div>
                <p className={`font-bold text-sm ${statusLvl >= 1 ? 'text-slate-800' : 'text-slate-400'}`}>Booking Confirmed</p>
                <p className="text-xs text-slate-400 mt-1">Pending Acceptance</p>
              </div>
              
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-0 bg-white">
                  {statusLvl >= 2 ? (
                    statusLvl === 2 ? <div className="w-4 h-4 bg-orange-500 border-4 border-orange-100 rounded-full mt-0.5"></div> : <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50" />
                  ) : <Circle size={16} className="text-slate-300" />}
                </div>
                <p className={`font-bold text-sm ${statusLvl === 2 ? 'text-orange-500' : statusLvl > 2 ? 'text-slate-800' : 'text-slate-400'}`}>Worker Accepted</p>
              </div>
              
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-0 bg-white">
                  {statusLvl >= 3 ? (
                    statusLvl === 3 ? <div className="w-4 h-4 bg-orange-500 border-4 border-orange-100 rounded-full mt-0.5"></div> : <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50" />
                  ) : <Circle size={16} className="text-slate-300" />}
                </div>
                <p className={`font-bold text-sm ${statusLvl === 3 ? 'text-orange-500' : statusLvl > 3 ? 'text-slate-800' : 'text-slate-400'}`}>Worker is on the way</p>
              </div>
              
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-0 bg-white">
                  {statusLvl >= 4 ? (
                    statusLvl === 4 ? <div className="w-4 h-4 bg-orange-500 border-4 border-orange-100 rounded-full mt-0.5"></div> : <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50" />
                  ) : <Circle size={16} className="text-slate-300" />}
                </div>
                <p className={`font-bold text-sm ${statusLvl === 4 ? 'text-orange-500' : statusLvl > 4 ? 'text-slate-800' : 'text-slate-400'}`}>Work Started</p>
              </div>
              
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-0 bg-white">
                  {statusLvl >= 5 ? <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50" /> : <Circle size={16} className="text-slate-300" />}
                </div>
                <p className={`font-bold text-sm ${statusLvl >= 5 ? 'text-emerald-600' : 'text-slate-400'}`}>Completed</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-red-500 font-bold">This booking was cancelled or rejected.</p>
            </div>
          )}
        </div>

        {/* Action (Review) */}
        {statusLvl >= 5 && booking.status !== 'Rated' && (
          <Link to={`/customer/bookings/${bookingId}/review`} className="block w-full bg-slate-800 text-white text-center font-bold py-4 rounded-xl shadow-md transition hover:bg-slate-700">
            Review Service
          </Link>
        )}
      </div>
      </div>
    </div>
  );
};

export default CustomerBookingDetails;
