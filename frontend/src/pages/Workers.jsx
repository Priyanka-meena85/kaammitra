import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, Search, MapPin } from 'lucide-react';
import WorkerCard from '../components/WorkerCard';
import { workers as dummyWorkers } from '../data/workers';
import { services } from '../data/services';
import api from '../utils/api';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';
import { calculateMatchingScore } from '../utils/matchingScore';
import { useSimpleMode } from '../context/SimpleModeContext';

const Workers = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isSimpleMode } = useSimpleMode();
  const serviceQuery = searchParams.get('service') || '';
  
  const [searchTerm, setSearchTerm] = useState(serviceQuery);
  const [selectedService, setSelectedService] = useState(serviceQuery);
  const [selectedArea, setSelectedArea] = useState('All');
  const [allWorkers, setAllWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  
  // Filters
  const [distanceFilter, setDistanceFilter] = useState('all'); // all, 5, 15
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [emergencyAvailableOnly, setEmergencyAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(!isSimpleMode);

  const [areas, setAreas] = useState([]);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await api.get('/areas');
        setAreas(res?.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch areas', err);
        setAreas([]);
      }
    };
    fetchAreas();
  }, []);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const cityParam = searchParams.get('city');
        const url = (cityParam && cityParam !== 'All Cities') ? `/workers?city=${cityParam}` : '/workers';
        const res = await api.get(url);
        const workersData = res?.data?.data || [];
        if (workersData.length > 0) {
          setAllWorkers(workersData);
        } else {
          // If no workers from API, check demo mode
          if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_DATA === 'true') {
            setAllWorkers(dummyWorkers);
            toast('Demo data shown because development fallback is enabled.', { icon: 'ℹ️' });
          } else {
            setAllWorkers([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch workers', err);
        if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_DATA === 'true') {
          setAllWorkers(dummyWorkers);
          toast('Demo data shown because development fallback is enabled.', { icon: 'ℹ️' });
        } else {
          setAllWorkers([]);
          if (err.isWakingUp) {
            setApiError('Server is waking up. Please wait 30 seconds and try again.');
          } else {
            toast.error('Unable to load workers. Please try again.');
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, [searchParams]);

  useEffect(() => {
    let result = [...allWorkers];

    // Search and Service Filter
    const filterTerm = selectedService || searchTerm;
    if (filterTerm) {
      const lower = filterTerm.toLowerCase();
      result = result.filter(w => 
        (w.service && w.service.toLowerCase().includes(lower)) || 
        (w.services && w.services.some(s => s.toLowerCase().includes(lower))) ||
        (w.skills && w.skills.some(s => s.toLowerCase().includes(lower)))
      );
    }

    // Area
    if (selectedArea !== 'All') {
        result = result.filter(w => w.area === selectedArea || w.city === selectedArea);
    }

    // Distance Filter
    if (distanceFilter !== 'all') {
      const maxDist = parseInt(distanceFilter);
      result = result.filter(w => w.distance <= maxDist || w.maxTravelDistance <= maxDist);
    }

    // Verified
    if (verifiedOnly) result = result.filter(w => w.isVerified || w.verificationStatus === 'Verified');
    
    // Available
    if (availableOnly) result = result.filter(w => w.isAvailable);

    // Emergency
    if (emergencyAvailableOnly) result = result.filter(w => w.emergencyAvailable);

    // Smart Matching Sort
    // We pass null for userLocation currently, could integrate GPS later
    result.sort((a, b) => {
        const scoreA = calculateMatchingScore(a, null, emergencyAvailableOnly);
        const scoreB = calculateMatchingScore(b, null, emergencyAvailableOnly);
        return scoreB - scoreA;
    });

    setFilteredWorkers(result);
  }, [searchTerm, selectedService, selectedArea, distanceFilter, verifiedOnly, availableOnly, emergencyAvailableOnly, allWorkers]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">
          {selectedService ? `Workers for ${selectedService}` : 'Find Workers near you'}
        </h1>
        <p className="text-text-gray">Showing {filteredWorkers.length} workers based on your criteria.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center justify-center gap-2 bg-card-white border border-border-gray py-3 rounded-xl font-bold text-navy shadow-sm"
        >
          <Filter size={20} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Filters Sidebar */}
        <div className={`w-full lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-card-white p-6 rounded-2xl shadow-sm border border-border-gray sticky top-24">
            <h2 className="text-lg font-bold text-navy flex items-center gap-2 mb-6">
              <Filter size={20} /> Filters
            </h2>
            
            <div className="space-y-6">
              {!isSimpleMode && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text-gray mb-2">Search Service</label>
                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" />
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setSelectedService('');
                        }}
                        placeholder="e.g. Electrician"
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-border-gray focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-gray mb-2">Area / City</label>
                    <select 
                      value={selectedArea} 
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="w-full p-2 rounded-lg border border-border-gray focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="All">All Areas</option>
                      {[...new Set(areas.map(a => a.city))].map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Service Category */}
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Category</label>
                <select 
                  value={selectedService} 
                  onChange={(e) => {
                    setSelectedService(e.target.value);
                    setSearchTerm('');
                  }}
                  className={`w-full rounded-lg border border-border-gray focus:ring-2 focus:ring-primary focus:outline-none ${isSimpleMode ? 'p-4 text-lg font-bold' : 'p-2'}`}
                >
                  <option value="">All Services</option>
                  {services.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.hindiName})</option>
                  ))}
                </select>
              </div>

              {/* Distance */}
              {!isSimpleMode && (
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2">Distance Zone</label>
                  <select 
                    value={distanceFilter} 
                    onChange={(e) => setDistanceFilter(e.target.value)}
                    className="w-full p-2 rounded-lg border border-border-gray focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="all">Any Distance</option>
                    <option value="5">Green Zone (0-5 km)</option>
                    <option value="15">Yellow Zone (5-15 km)</option>
                  </select>
                </div>
              )}

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={availableOnly} 
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className={`text-primary rounded ${isSimpleMode ? 'w-6 h-6' : 'w-4 h-4'}`}
                  />
                  <span className={`text-navy font-medium ${isSimpleMode ? 'text-lg' : ''}`}>Available Now</span>
                </label>
                {!isSimpleMode && (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={verifiedOnly} 
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <span className="text-text-gray">Verified Workers Only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={emergencyAvailableOnly} 
                        onChange={(e) => setEmergencyAvailableOnly(e.target.checked)}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <span className="text-text-gray">Emergency Ready</span>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Worker List */}
        <div className="w-full lg:w-3/4">
          {loading ? (
            <div className="text-center py-20 text-text-gray font-medium">Loading workers...</div>
          ) : apiError ? (
            <div className="bg-orange-50 rounded-3xl shadow-sm border border-orange-200 p-12 text-center">
              <AlertTriangle size={64} className="mx-auto text-orange-400 mb-4" />
              <h2 className="text-2xl font-bold text-orange-900 mb-2">{apiError}</h2>
              <p className="text-orange-700 mb-6">Render's free tier sleeps after 15 minutes of inactivity. It takes a moment to spin back up.</p>
              <button onClick={() => window.location.reload()} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md">
                Try Again
              </button>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="bg-card-white rounded-3xl shadow-sm border border-border-gray p-12 text-center">
              <Search size={64} className="mx-auto text-border-gray mb-4" />
              <h2 className="text-2xl font-bold text-navy mb-2">No workers available in your area yet.</h2>
              <p className="text-text-gray mb-6">Want us to find one for you or want to register as a worker?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate('/callback-request')} className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md">
                  Request Callback
                </button>
                <button onClick={() => navigate('/worker-register')} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md">
                  Become Worker
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredWorkers.map((worker, index) => (
                <WorkerCard key={worker._id || worker.id || index} worker={worker} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workers;
