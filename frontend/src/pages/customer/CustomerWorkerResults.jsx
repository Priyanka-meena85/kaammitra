import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, MapPin, Loader2 } from 'lucide-react';
import WorkerCard from '../../components/customer/WorkerCard';
import EmptyState from '../../components/customer/EmptyState';
import { suggestWorkers } from '../../api/customerApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CustomerWorkerResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const searchState = location.state || {};
  const queryText = searchState.text || '';
  const serviceQuery = searchState.service || queryText || 'Service';

  const [activeFilter, setActiveFilter] = useState('Available');
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const filters = ['Available', 'Distance', 'Rating', 'Price'];

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await suggestWorkers({
          service: serviceQuery,
          city: user?.city || 'Jaipur'
        });
        
        if (res.success && res.data) {
          const mappedWorkers = res.data.map(item => item.worker || item);
          setWorkers(mappedWorkers);
        } else {
          setWorkers([]);
        }
      } catch (err) {
        console.error("Failed to fetch workers", err);
        if (!err.isWakingUp) {
          toast.error("Failed to find workers nearby.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [serviceQuery, user]);

  return (
    <div className="bg-slate-50 min-h-screen pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 pt-6 pb-4 border-b border-slate-100 shadow-sm md:pt-8 md:static md:shadow-none md:border-none md:bg-transparent md:px-0">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 md:hidden">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-slate-800">{serviceQuery} Workers</h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium flex items-center mt-0.5">
              <MapPin size={12} className="mr-1 text-orange-500" /> {user?.city || 'Jaipur'}
            </p>
          </div>
        </div>

        {/* Filters Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <button className="flex items-center gap-1 bg-white text-slate-600 px-4 py-2 rounded-full text-sm font-bold shrink-0 border border-slate-200 shadow-sm">
            <SlidersHorizontal size={16} />
            Filters
          </button>
          {filters.map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-sm font-bold shrink-0 border transition-all ${
                activeFilter === filter 
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-0 mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
            <p className="font-medium">Finding the best workers nearby...</p>
          </div>
        ) : workers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {workers.map(w => (
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
        ) : (
          <EmptyState 
            title="No workers found"
            message={`We couldn't find any ${serviceQuery} workers matching your criteria nearby.`}
            actionText="Change Location"
            onAction={() => toast('Change location coming soon')}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerWorkerResults;
