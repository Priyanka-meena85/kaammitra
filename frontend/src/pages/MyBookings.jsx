import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('kaammitra_bookings') || '[]');
    setBookings(saved);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Accepted': return 'bg-bg-soft-blue text-primary-hover';
      case 'Completed': return 'bg-accent-green/20 text-green-800';
      case 'Cancelled': return 'bg-accent-orange/20 text-red-800';
      default: return 'bg-bg-soft-blue text-navy';
    }
  };

  const cancelBooking = (id) => {
    if(window.confirm('Are you sure you want to cancel this booking?')) {
      const updated = bookings.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b);
      setBookings(updated);
      localStorage.setItem('kaammitra_bookings', JSON.stringify(updated));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-navy mb-8">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center p-12 bg-card-white rounded-2xl shadow-sm border border-border-gray">
          <p className="text-text-gray mb-4">You have no bookings yet.</p>
          <a href="/services" className="text-primary font-bold hover:underline">Browse Services</a>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6 flex flex-col md:flex-row justify-between gap-6">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-navy">{booking.service}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  {booking.urgency === 'Urgent' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent-orange/20 text-accent-orange-hover">Urgent</span>
                  )}
                </div>
                
                <p className="text-text-gray mb-4 text-sm bg-bg-warm p-3 rounded-lg border border-border-gray">
                  {booking.problem}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-text-gray">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-border-gray" />
                    <span className="font-medium">{booking.workerName}</span>
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
              </div>

              <div className="flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-border-gray pt-4 md:pt-0 md:pl-6 min-w-[150px]">
                {booking.status === 'Pending' && (
                  <>
                    <button 
                      onClick={() => cancelBooking(booking.id)}
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
                <div className="text-center mt-auto pt-2">
                  <p className="text-xs text-border-gray">ID: {booking.id}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
