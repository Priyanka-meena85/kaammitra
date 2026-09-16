import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Wrench, Loader2 } from 'lucide-react';
import { getMyBookings } from '../../api/customerApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CustomerBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        if (!user || !user.id) return;
        const res = await getMyBookings(user.id);
        if (res.success) {
          setBookings(res.data);
        }
      } catch (err) {
        console.error("Failed to load bookings", err);
        if (!err.isWakingUp) toast.error("Failed to load your bookings");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user]);
  
  const filterBookings = () => {
    if (activeTab === 'Upcoming') {
      return bookings.filter(b => ['Pending', 'Accepted'].includes(b.status));
    }
    if (activeTab === 'Active') {
      return bookings.filter(b => ['On the Way', 'In Progress'].includes(b.status));
    }
    if (activeTab === 'Completed') {
      return bookings.filter(b => ['Completed', 'Rated', 'Cancelled', 'Rejected'].includes(b.status));
    }
    return [];
  };

  const displayedBookings = filterBookings();

  return (
    <div className="bg-slate-50 min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-0 border-b border-slate-100 shadow-sm sticky top-0 z-10 md:static md:shadow-none md:border-none md:bg-transparent md:pt-8 md:px-0">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">My Bookings</h1>
        </div>
        
        <div className="flex justify-between border-b border-slate-200">
          {['Upcoming', 'Active', 'Completed'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 text-sm font-bold transition-colors relative ${
                activeTab === tab ? 'text-orange-500' : 'text-slate-500'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 pt-6 md:px-0">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : displayedBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {displayedBookings.map(booking => (
              <Link 
                key={booking._id}
              to={`/customer/bookings/${booking._id}`} 
              className="block bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-4 transition hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{booking.serviceId?.name || 'Service Request'}</h3>
                    <p className="text-xs text-slate-500 font-medium">{booking.workerId?.name || 'Worker Assignment'}</p>
                  </div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-md ${
                  ['Completed', 'Rated'].includes(booking.status) ? 'bg-emerald-50 text-emerald-700' :
                  ['Cancelled', 'Rejected'].includes(booking.status) ? 'bg-red-50 text-red-700' :
                  'bg-orange-50 text-blue-700'
                }`}>
                  {booking.status}
                </div>
              </div>
              
              <div className="flex flex-col gap-2 text-sm text-slate-600 mt-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="flex items-center gap-2 font-medium">
                  <Clock size={16} className="text-slate-400" /> 
                  {new Date(booking.date).toLocaleDateString()} • {booking.time}
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <MapPin size={16} className="text-slate-400" /> {booking.address}
                </span>
              </div>
              <div className="mt-4 text-center text-sm font-bold text-orange-500">
                View Tracking Details
              </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Clock size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No {activeTab.toLowerCase()} bookings</h3>
            <p className="text-slate-500 text-sm">When you book a service, it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerBookings;
