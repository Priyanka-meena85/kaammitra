import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Phone, MapPin, Star, AlertTriangle } from 'lucide-react';
import VoiceSearch from '../components/VoiceSearch';
import ServiceCard from '../components/ServiceCard';
import WorkerCard from '../components/WorkerCard';
import TrustCard from '../components/TrustCard';
import { services } from '../data/services';
import { workers } from '../data/workers';
import { getUserLocation } from '../utils/location';

const Home = () => {
  const navigate = useNavigate();

  const handleSearch = (query) => {
    navigate(`/workers?service=${encodeURIComponent(query)}`);
  };

  const handleUseLocation = async () => {
    try {
      const loc = await getUserLocation();
      localStorage.setItem('user_location', JSON.stringify(loc));
      alert('Location saved! We will show workers near you.');
    } catch (error) {
      alert('Could not get location. Please allow location access.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-navy leading-tight mb-6">
                Kaam bolo, <span className="text-primary">trusted worker</span> pao.
              </h1>
              <p className="text-lg md:text-xl text-text-gray mb-8 max-w-lg">
                Find verified nearby workers for home, shop and business services by voice, call, WhatsApp or simple booking.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <button 
                  onClick={() => navigate('/workers')}
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Find Worker
                </button>
                <button 
                  onClick={() => navigate('/worker-register')}
                  className="bg-card-white hover:bg-bg-warm text-primary border border-primary/30 px-6 py-3 rounded-xl font-bold text-lg shadow-sm hover:shadow-md transition-all"
                >
                  I am Worker (वर्कर बनें)
                </button>
              </div>
              
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
            {services.map(service => (
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
            {workers.slice(0, 4).map(worker => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
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
