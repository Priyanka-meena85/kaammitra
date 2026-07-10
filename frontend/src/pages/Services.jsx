import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, AlertTriangle, ShieldCheck, Phone, Star, UserCheck, MessageCircle } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import { services } from '../data/services';
import { getUserLocation } from '../utils/location';
import toast from 'react-hot-toast';

const Services = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const WHATSAPP_SUPPORT_NUMBER = import.meta.env.VITE_WHATSAPP_SUPPORT_NUMBER || "918503996575";
  const WHATSAPP_SUPPORT_MESSAGE = "Hello KaamMitra, mujhe ek service ke regarding help chahiye.";
  const whatsappUrl = `https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=${encodeURIComponent(WHATSAPP_SUPPORT_MESSAGE)}`;
  const supportNumber = WHATSAPP_SUPPORT_NUMBER;
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Repair', 'Home Service', 'Construction', 'Cleaning', 'Emergency'];

  const handleLocation = async () => {
    try {
      const loc = await getUserLocation();
      localStorage.setItem('user_location', JSON.stringify(loc));
      toast.success('Location saved successfully. We will show results near you.');
    } catch(e) {
      toast.error('Location access denied or failed.');
    }
  };

  // Filter Logic
  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      service.hindiName.includes(searchTerm);
    
    const matchesCategory = 
      activeCategory === 'All' ? true :
      activeCategory === 'Emergency' ? service.badge === 'Emergency' :
      service.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-bg-warm">
      
      {/* 1. Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16 md:py-24 px-4 relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-card-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-400 opacity-10 rounded-full blur-2xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Choose a service and get <span className="text-blue-300">trusted help</span> near you
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-medium">
            Book verified electricians, plumbers, cleaners, carpenters and local workers by voice, call, WhatsApp or simple booking.
          </p>

          {/* Search Bar Container */}
          <div className="bg-card-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto mb-8">
            <div className="relative flex-grow flex items-center">
              <Search className="absolute left-4 text-border-gray" size={24} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search service like electrician, plumber, cleaner..." 
                className="w-full pl-12 pr-4 py-4 rounded-xl text-navy text-lg outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <button className="bg-primary hover:bg-primary-hover text-white font-bold text-lg px-8 py-4 rounded-xl shadow-md transition-colors md:w-auto w-full">
              Search
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={handleLocation}
              className="flex items-center gap-2 bg-card-white/10 hover:bg-card-white/20 border border-white/20 px-6 py-3 rounded-full font-semibold backdrop-blur-sm transition-all"
            >
              <MapPin size={20} className="text-blue-200" /> Use My Location
            </button>
            <button 
              onClick={() => navigate('/emergency')}
              className="flex items-center gap-2 bg-accent-orange hover:bg-accent-orange text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-red-500/30 transition-all"
            >
              <AlertTriangle size={20} /> Emergency Help
            </button>
          </div>
        </div>
      </section>

      {/* 2. Trust Badges */}
      <section className="bg-card-white border-b border-border-gray py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-primary" size={28} />
            <span className="font-bold text-navy">Verified Workers</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="text-accent-green" size={28} />
            <span className="font-bold text-navy">Nearby Matching</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-orange-500" size={28} />
            <span className="font-bold text-navy">Call & WhatsApp</span>
          </div>
          <div className="flex items-center gap-3">
            <Star className="text-amber-400 fill-amber-400" size={28} />
            <span className="font-bold text-navy">Rated Professionals</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* 5. Category Filters */}
        <div className="flex overflow-x-auto gap-3 pb-4 mb-8 scrollbar-hide">
          {(Array.isArray(categories) ? categories : []).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all shadow-sm ${
                activeCategory === cat 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-card-white text-text-gray border border-border-gray hover:bg-bg-soft-blue hover:border-border-gray'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 4. Service Cards Grid */}
        {(Array.isArray(filteredServices) ? filteredServices : []).length === 0 ? (
          <div className="text-center py-20 bg-card-white rounded-3xl border border-border-gray">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-navy mb-2">No services found</h3>
            <p className="text-text-gray">Try searching with a different keyword or category.</p>
            <button 
              onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
              className="mt-6 text-primary font-bold hover:underline"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(Array.isArray(filteredServices) ? filteredServices : []).map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

      </section>

      {/* 6. Bottom CTA Section */}
      <section className="mt-auto bg-card-white border-t border-border-gray py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-bg-soft-blue text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCheck size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-navy mb-4">Service nahi mil rahi?</h2>
          <p className="text-lg text-text-gray mb-8 max-w-2xl mx-auto">
            Hume call karein ya WhatsApp par requirement bhejein. Hum aapki madad karenge!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href={`tel:+${supportNumber}`}
              className="flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
            >
              <Phone size={24} /> Call Support
            </a>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-accent-green hover:bg-accent-green text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
            >
              <MessageCircle size={24} /> WhatsApp Help
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Services;
