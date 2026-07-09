import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StatusTimeline from '../components/StatusTimeline';
import ComplaintModal from '../components/ComplaintModal';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const endpoint = user.role === 'worker' ? `/bookings/worker/${user._id}` : `/bookings/customer/${user._id}`;
        const res = await api.get(endpoint);
        setBookings(res.data.data);

        // Fetch complaints to show status
        try {
          const compRes = await api.get('/complaints/my'); 
          setComplaints(compRes.data.data);
        } catch (e) {
          console.warn('Could not fetch complaints', e);
        }
      } catch (err) {
        console.error('Failed to load bookings', err);
      }
    };
    fetchData();
  }, [user]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Accepted': return 'bg-bg-soft-blue text-primary-hover';
      case 'Completed': return 'bg-accent-green/20 text-green-800';
      case 'Cancelled': return 'bg-accent-orange/20 text-red-800';
      default: return 'bg-bg-soft-blue text-navy';
    }
  };

  const cancelBooking = async (id) => {
    if(window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.patch(`/bookings/${id}/status`, { status: 'Cancelled' });
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'Cancelled' } : b));
        toast.success('Booking cancelled successfully');
      } catch (err) {
        toast.error('Failed to cancel booking');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-navy mb-8">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="bg-card-white rounded-3xl shadow-sm border border-border-gray p-12 text-center">
          <Calendar size={64} className="mx-auto text-border-gray mb-4" />
          <h2 className="text-2xl font-bold text-navy mb-2">No Bookings Yet</h2>
          <p className="text-text-gray mb-6">Looks like you haven't booked any services yet.</p>
          <button onClick={() => navigate('/services')} className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md">
            Find a Worker
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map(booking => (
            <div key={booking._id} className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6 flex flex-col md:flex-row justify-between gap-6">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-navy">{booking.serviceId?.name || booking.service}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  {booking.urgency === 'Urgent' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent-orange/20 text-accent-orange-hover">Urgent</span>
                  )}
                </div>
                
                <p className="text-text-gray mb-4 text-sm bg-bg-warm p-3 rounded-lg border border-border-gray">
                  {booking.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-text-gray">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-border-gray" />
                    <span className="font-medium">{user?.role === 'worker' ? booking.customerId?.name : booking.workerId?.name || booking.workerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-border-gray" />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-border-gray" />
                    <span>{booking.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-border-gray" />
                    <span className="truncate">{booking.address}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <StatusTimeline status={booking.status} />
                </div>
              </div>

              <div className="flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-border-gray pt-4 md:pt-0 md:pl-6 min-w-[150px]">
                {booking.status === 'Pending' && (
                  <>
                    <button 
                      onClick={() => cancelBooking(booking._id)}
                      className="w-full flex justify-center items-center gap-2 bg-accent-orange/10 hover:bg-accent-orange/20 text-accent-orange-hover py-2 rounded-lg font-medium transition-colors"
                    >
                      <XCircle size={18} /> Cancel
                    </button>
                  </>
                )}
                {booking.status === 'Completed' && (
                  <button className="w-full flex justify-center items-center gap-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 py-2 rounded-lg font-medium transition-colors">
                    <Star size={18} /> Rate Worker
                  </button>
                )}
                
                {(() => {
                  const bookingComplaint = complaints.find(c => String(c.bookingId) === String(booking._id) || (c.booking && String(c.booking._id) === String(booking._id)));
                  if (bookingComplaint) {
                    return (
                      <div className={`w-full flex justify-center items-center gap-2 py-2 rounded-lg font-medium mt-2 text-sm ${bookingComplaint.status === 'Resolved' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                        <AlertCircle size={16} /> 
                        Complaint: {bookingComplaint.status}
                      </div>
                    );
                  }
                  return (
                    <button 
                      onClick={() => {
                        setSelectedBooking(booking);
                        setComplaintModalOpen(true);
                      }}
                      className="w-full flex justify-center items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-medium transition-colors mt-2"
                    >
                      <AlertCircle size={18} /> Complaint
                    </button>
                  );
                })()}

                <div className="text-center mt-auto pt-2">
                  <p className="text-xs text-border-gray">ID: {booking._id}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {selectedBooking && (
        <ComplaintModal 
          isOpen={complaintModalOpen}
          onClose={() => {
            setComplaintModalOpen(false);
            setSelectedBooking(null);
          }}
          workerId={selectedBooking.worker?._id || selectedBooking.workerId}
          bookingId={selectedBooking._id}
        />
      )}
    </div>
  );
};

export default MyBookings;
