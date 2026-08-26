import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Shield, Phone, MapPin, Star, AlertTriangle } from 'lucide-react';
import VoiceSearch from '../components/VoiceSearch';
import ServiceCard from '../components/ServiceCard';
import WorkerCard from '../components/WorkerCard';
import TrustCard from '../components/TrustCard';
import { services } from '../data/services';
import { workers as dummyWorkers } from '../data/workers';
import { getUserLocation } from '../utils/location';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { extractArray } from '../utils/apiResponse';

const Home = () => {
  const navigate = useNavigate();
  const [topWorkers, setTopWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [areas, setAreas] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [showLaunchRequest, setShowLaunchRequest] = useState(false);
  const [launchFormData, setLaunchFormData] = useState({ name: '', phone: '', service: 'General' });

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await api.get('/areas');
        setAreas(extractArray(res));
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
        const url = selectedCity ? `/workers?limit=4&city=${selectedCity}` : '/workers?limit=4';
        const res = await api.get(url);
        const workersData = extractArray(res, ["workers"]);
        if (workersData.length > 0) {
          setTopWorkers(workersData.slice(0, 4));
        } else {
          setTopWorkers([]);
        }
      } catch (err) {
        console.error('Failed to fetch workers', err);
        setTopWorkers([]);
        if (err.isWakingUp) setApiError('Server is waking up. Please wait 30 seconds and try again.');
      } finally {
        setLoadingWorkers(false);
      }
    };
    fetchWorkers();
  }, [selectedCity]);

  const handleSearch = (query) => {
    navigate(`/workers?service=${encodeURIComponent(query)}${selectedCity ? `&city=${selectedCity}` : ''}`);
  };

  const handleUseLocation = async () => {
    try {
      const loc = await getUserLocation();
      localStorage.setItem('user_location', JSON.stringify(loc));
      toast.success('Location saved! We will show workers near you.');
    } catch (error) {
      toast.error('Could not get location. Please allow location access.');
    }
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    if (city === 'Other') {
      setShowLaunchRequest(true);
      setSelectedCity('');
    } else {
      setSelectedCity(city);
      setShowLaunchRequest(false);
    }
  };

  const handleLaunchRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/areas/launch', { ...launchFormData, city: 'Requested City', area: 'Requested Area' });
      toast.success('Request submitted! We will notify you when we launch.');
      setShowLaunchRequest(false);
    } catch (err) {
      toast.error('Failed to submit request');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>KaamMitra | Your Local Worker Marketplace</title>
        <meta name="description" content="Find trusted local workers for your everyday needs instantly. Plumbers, electricians, cleaners, and more in your city." />
      </Helmet>
      {/* Hero Section */}
      <section className="market-hero relative overflow-hidden py-12 md:py-20">
        <div className="market-hero-grid absolute inset-0 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center relative">
            
            {/* Left Content */}
            <div className="reveal-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/75 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-primary mb-5">
                <span className="h-2 w-2 rounded-full bg-accent-green animate-pulse" /> Trusted help, close to home
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[4.25rem] font-extrabold text-navy leading-[1.05] mb-5">
                Ghar ka kaam? <span className="text-primary">Mitra bulao.</span>
              </h1>
              <p className="text-base md:text-lg text-text-gray mb-7 max-w-lg leading-relaxed">
                Verified electricians, plumbers and cleaners from your area. See real ratings, know the price, and book with confidence.
              </p>

              <div className="mb-7 max-w-xl bg-white/95 p-4 md:p-5 rounded-2xl shadow-xl border border-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-extrabold text-navy">What do you need done?</h3>
                  <span className="text-xs font-bold text-accent-green">Free to search</span>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const service = e.target.service.value;
                  const city = selectedCity;
                  const area = e.target.area.value;
                  const urgency = e.target.urgency.value;
                  const maxBudget = e.target.maxBudget.value;
                  let url = `/workers?smart=true`;
                  if (service) url += `&service=${encodeURIComponent(service)}`;
                  if (city) url += `&city=${encodeURIComponent(city)}`;
                  if (area) url += `&area=${encodeURIComponent(area)}`;
                  if (urgency === 'emergency') url += `&urgency=emergency`;
                  if (maxBudget) url += `&maxBudget=${encodeURIComponent(maxBudget)}`;
                  navigate(url);
                }} className="space-y-3">
                  <div>
                    <label htmlFor="hero-service" className="sr-only">Service you need</label>
                    <input id="hero-service" name="service" type="text" placeholder="Try “fan repair” or “plumber”" className="w-full px-4 py-3 rounded-xl border border-border-gray bg-bg-warm focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="hero-city" className="sr-only">City</label>
                      <select
                        id="hero-city"
                        value={selectedCity}
                        onChange={handleCityChange}
                        className="w-full px-4 py-3 rounded-xl border border-border-gray bg-bg-warm focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        <option value="">All Cities</option>
                        {[...new Set((Array.isArray(areas) ? areas : []).map(a => a.city))].map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                        <option value="Other">Other...</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="hero-area" className="sr-only">Area or landmark</label>
                      <input id="hero-area" name="area" type="text" placeholder="Area or landmark" className="w-full px-4 py-3 rounded-xl border border-border-gray bg-bg-warm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="hero-urgency" className="sr-only">Urgency</label>
                      <select id="hero-urgency" name="urgency" className="w-full px-4 py-3 rounded-xl border border-border-gray bg-bg-warm focus:ring-2 focus:ring-primary focus:outline-none">
                        <option value="normal">Normal</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="hero-budget" className="sr-only">Maximum budget in rupees</label>
                      <input id="hero-budget" name="maxBudget" type="number" min="0" step="50" placeholder="Budget (optional)" className="w-full px-4 py-3 rounded-xl border border-border-gray bg-bg-warm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white px-6 py-3.5 rounded-xl font-extrabold shadow-md transition-all">
                    Find trusted workers <span aria-hidden="true">→</span>
                  </button>
                </form>
              </div>

              {showLaunchRequest && (
                <div className="mb-8 bg-white p-6 rounded-2xl shadow-lg border border-red-100">
                  <h3 className="text-lg font-bold text-red-500 mb-2">KaamMitra is not active in your area yet.</h3>
                  <p className="text-text-gray mb-4 text-sm">Request a launch in your area and we'll notify you!</p>
                  <form onSubmit={handleLaunchRequest} className="space-y-3">
                    <input aria-label="Your Name" type="text" required placeholder="Your Name" value={launchFormData.name} onChange={e => setLaunchFormData({...launchFormData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-border-gray focus:ring-2 focus:ring-primary" />
                    <input aria-label="Phone Number" type="tel" required placeholder="Phone Number" value={launchFormData.phone} onChange={e => setLaunchFormData({...launchFormData, phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-border-gray focus:ring-2 focus:ring-primary" />
                    <button type="submit" className="w-full bg-primary text-white font-bold py-2 rounded-xl shadow hover:bg-primary-hover">Request Launch in My Area</button>
                    <button type="button" onClick={() => navigate('/callback-request')} className="w-full bg-card-white text-primary border border-primary font-bold py-2 rounded-xl shadow hover:bg-bg-soft-blue">Request Callback Instead</button>
                  </form>
                </div>
              )}
              
              {!showLaunchRequest && (
                  <div className="flex flex-wrap gap-3 mb-7">
                  <button 
                    onClick={() => navigate('/worker-register')}
                    className="bg-white/80 hover:bg-white text-primary border border-primary/30 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all"
                  >
                    I am Worker (वर्कर बनें)
                  </button>
                </div>
              )}
              
              <button 
                onClick={() => navigate('/emergency')}
                className="flex items-center gap-2 text-accent-orange font-bold hover:text-accent-orange-hover"
              >
                <AlertTriangle size={20} />
                Emergency Help Needed?
              </button>
            </div>

            {/* Right Content - Voice Search */}
            <div className="flex flex-col items-center">
              <VoiceSearch onSearch={handleSearch} />
              
              <button 
                onClick={handleUseLocation}
                className="mt-6 flex items-center gap-2 text-text-gray bg-card-white px-4 py-2 rounded-full shadow-sm hover:shadow-md border border-border-gray transition-all font-medium"
              >
                <MapPin size={18} className="text-primary" />
                Use My Location
              </button>
            </div>
            
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-12 bg-card-white border-b border-border-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <TrustCard icon={Shield} title="Verified Workers" description="ID and background checked" color="blue" />
          <TrustCard icon={Phone} title="Call & WhatsApp" description="Direct communication" color="green" />
          <TrustCard icon={MapPin} title="Nearby Matching" description="Find workers in your area" color="purple" />
          <TrustCard icon={Star} title="Ratings & Reviews" description="Trusted by the community" color="amber" />
        </div>
      </section>

      {/* Quick Services Section */}
      <section className="py-16 bg-bg-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">Our Services (हमारी सेवाएँ)</h2>
            <p className="text-text-gray max-w-2xl mx-auto">Choose a service to find verified workers near you instantly.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(Array.isArray(services) ? services : []).map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-card-white border-t border-border-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">How It Works (कैसे काम करता है)</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-bg-soft-blue text-primary rounded-full flex items-center justify-center text-2xl font-bold mb-4">1</div>
              <h3 className="text-xl font-bold text-navy mb-2">Boliye ya select kijiye</h3>
              <p className="text-text-gray">Use voice search or select a service you need.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-bg-soft-blue text-primary rounded-full flex items-center justify-center text-2xl font-bold mb-4">2</div>
              <h3 className="text-xl font-bold text-navy mb-2">Verified worker choose kijiye</h3>
              <p className="text-text-gray">See ratings, distance, and profiles of nearby workers.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-bg-soft-blue text-primary rounded-full flex items-center justify-center text-2xl font-bold mb-4">3</div>
              <h3 className="text-xl font-bold text-navy mb-2">Call, WhatsApp ya Book kijiye</h3>
              <p className="text-text-gray">Connect directly or schedule a booking instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Workers Preview */}
      <section className="py-16 bg-bg-warm border-t border-border-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-2">Top Rated Workers</h2>
              <p className="text-text-gray">Available workers near your location.</p>
            </div>
            <button onClick={() => navigate('/workers')} className="text-primary font-bold hover:text-primary-hover hidden sm:block">
              View All →
            </button>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {loadingWorkers ? (
              <div className="col-span-2 text-center text-text-gray py-4">Loading workers...</div>
            ) : apiError ? (
              <div className="col-span-2 text-center text-orange-600 bg-orange-50 p-4 rounded-xl border border-orange-200 font-medium flex items-center justify-center gap-2">
                <AlertTriangle size={20} />
                {apiError}
              </div>
            ) : (Array.isArray(topWorkers) ? topWorkers : []).length === 0 ? (
              <div className="lg:col-span-2 bg-card-white p-8 rounded-2xl border border-border-gray text-center text-text-gray">
                No workers found in this area yet. Be the first to register!
              </div>
            ) : (
              (Array.isArray(topWorkers) ? topWorkers : []).map((worker, index) => (
                <WorkerCard key={worker._id || worker.id || index} worker={worker} />
              ))
            )}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <button onClick={() => navigate('/workers')} className="w-full bg-card-white border border-border-gray text-text-gray py-3 rounded-xl font-bold">
              View All Workers
            </button>
          </div>
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="py-16 bg-accent-orange text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AlertTriangle size={48} className="mx-auto mb-6 text-red-200" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Urgent electrician, plumber ya repair chahiye?</h2>
          <p className="text-red-100 text-lg mb-8 max-w-2xl mx-auto">
            Emergency help ke liye nearby available worker se turant connect karein. Don't wait!
          </p>
          <button 
            onClick={() => navigate('/emergency')}
            className="bg-card-white text-accent-orange px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-bg-warm hover:scale-105 transition-all"
          >
            Get Emergency Help Now
          </button>
        </div>
      </section>

    </div>
  );
};

export default Home;
