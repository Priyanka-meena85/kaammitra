import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import VoiceSearchCard from '../../components/customer/VoiceSearchCard';
import CategoryGrid from '../../components/customer/CategoryGrid';
import WorkerCard from '../../components/customer/WorkerCard';
import ServiceCard from '../../components/ServiceCard';
import { services } from '../../data/services';
import { getMyBookings, getTrustedWorkers } from '../../api/customerApi';
import toast from 'react-hot-toast';

const CustomerHome = () => {
  const { user } = useAuth();
  
  const [upcomingBooking, setUpcomingBooking] = useState(null);
  const [trustedWorkers, setTrustedWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        if (!user || !user.id) return;
        
        // Fetch bookings to find upcoming
        const bookingsRes = await getMyBookings(user.id);
        if (bookingsRes.success && bookingsRes.data) {
          const upcoming = bookingsRes.data.find(b => 
            ['Pending', 'Accepted', 'On the Way', 'In Progress'].includes(b.status)
          );
          setUpcomingBooking(upcoming || null);
        }
        
        // Fetch trusted workers (or just nearby workers for now)
        const workersRes = await getTrustedWorkers();
        if (workersRes.success && workersRes.data) {
          setTrustedWorkers(workersRes.data.slice(0, 2)); // Show top 2
        }
      } catch (err) {
        console.error("Failed to load home data", err);
        // Only show toast if it's not a generic abort
        if (!err.isWakingUp) {
          toast.error("Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, [user]);
  
  return (
    <div className="bg-slate-50 min-h-screen pb-24 md:pb-12">
      
      {/* Hero Section (Soft & Open) */}
      <div className="bg-gradient-to-b from-orange-50 to-slate-50 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hi, {user?.name?.split(' ')[0] || 'Friend'} 👋</h1>
              <p className="text-slate-500 font-medium mt-1">What do you need help with today?</p>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="hidden md:flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100 text-slate-600 font-medium text-sm">
                 <MapPin size={16} className="text-orange-500" />
                 {user?.city || 'Jaipur'}
               </div>
               <Link to="/customer/notifications" className="relative p-2.5 bg-white rounded-full shadow-sm border border-slate-100 text-slate-600 hover:text-orange-500 transition-colors">
                 <Bell size={20} />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
               </Link>
            </div>
          </div>

          {/* Integrated Sleek Search Pill */}
          <div className="max-w-2xl">
            <VoiceSearchCard />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-12">
        
        {/* Categories Section */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold text-slate-800">Explore Services</h2>
            <Link to="/customer/categories" className="text-sm font-bold text-orange-500 hover:text-orange-600">See All</Link>
          </div>
          <CategoryGrid />
        </section>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            
            {/* Upcoming Booking (Only show if exists) */}
            {upcomingBooking && (
              <section>
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Upcoming Booking</h2>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all max-w-2xl">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-md mb-3">
                        {upcomingBooking.status}
                      </span>
                      <h3 className="font-bold text-xl text-slate-800">{upcomingBooking.serviceId?.name || 'Service Request'}</h3>
                      <p className="text-sm font-medium text-slate-500 mt-1">
                        {new Date(upcomingBooking.date).toLocaleDateString()} at {upcomingBooking.time}
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                      {upcomingBooking.workerId?.name ? upcomingBooking.workerId.name.substring(0, 2).toUpperCase() : 'WK'}
                    </div>
                  </div>
                  <Link to={`/customer/bookings/${upcomingBooking._id}`} className="block w-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-center py-3 rounded-xl font-bold text-sm transition-colors">
                    View Details & Track
                  </Link>
                </div>
              </section>
            )}

            {/* Trusted Workers */}
            {trustedWorkers.length > 0 && (
              <section>
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Trusted Pros Near You</h2>
                  <span className="text-sm font-medium text-slate-400">Top Rated</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trustedWorkers.map(w => (
                    <WorkerCard 
                      key={w._id}
                      id={w._id}
                      name={w.name}
                      service={w.services?.[0] || 'Expert Service'}
                      rating={w.averageRating || 0}
                      distance={Math.floor(Math.random() * 5) + 1}
                      available={w.isAvailable}
                      price={w.expectedCharge || 299}
                    />
                  ))}
                </div>
              </section>
            )}
            
          </div>
        )}
        
        {/* Popular Services Grid */}
        <section className="pt-4">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold text-slate-800">Popular Services</h2>
            <Link to="/customer/search/categories" className="text-sm font-bold text-orange-500 hover:text-orange-600">Browse All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.slice(0, 8).map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerHome;
