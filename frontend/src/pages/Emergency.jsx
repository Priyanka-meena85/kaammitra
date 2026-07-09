import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Phone, MapPin, Zap, Droplet } from 'lucide-react';
import { getUserLocation } from '../utils/location';

const Emergency = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');

  const handleLocation = async () => {
    try {
      await getUserLocation();
      setAddress('Fetched from GPS Location');
      alert('Location saved. Showing nearby emergency workers.');
    } catch(e) {
      alert('Location access denied');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-accent-orange rounded-3xl shadow-xl text-white p-8 md:p-12 text-center mb-12">
        <AlertTriangle size={64} className="mx-auto mb-6 text-red-200 animate-pulse" />
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Emergency Help</h1>
        <p className="text-xl text-red-100 max-w-2xl mx-auto">
          Need immediate assistance? Select an urgent service below and we will connect you to the nearest available worker right now.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div 
          onClick={() => navigate('/workers?service=Electrician')}
          className="bg-card-white border-2 border-red-100 hover:border-red-500 rounded-2xl p-6 text-center cursor-pointer shadow-sm hover:shadow-lg transition-all group"
        >
          <Zap size={48} className="mx-auto mb-4 text-accent-orange group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold text-navy mb-2">Short Circuit / Power Cut</h2>
          <p className="text-text-gray">Urgent Electrician (बिजली मिस्त्री)</p>
        </div>
        
        <div 
          onClick={() => navigate('/workers?service=Plumber')}
          className="bg-card-white border-2 border-red-100 hover:border-red-500 rounded-2xl p-6 text-center cursor-pointer shadow-sm hover:shadow-lg transition-all group"
        >
          <Droplet size={48} className="mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold text-navy mb-2">Pipe Burst / Leakage</h2>
          <p className="text-text-gray">Urgent Plumber (प्लम्बर)</p>
        </div>
      </div>

      <div className="bg-card-white rounded-3xl shadow-sm border border-border-gray p-8 text-center">
        <h2 className="text-2xl font-bold text-navy mb-6">Or Call Emergency Support</h2>
        <button 
          onClick={() => window.open('tel:18001234567', '_self')}
          className="inline-flex items-center gap-3 bg-accent-orange hover:bg-accent-orange-hover text-white px-8 py-4 rounded-full font-bold text-xl shadow-lg transition-all"
        >
          <Phone size={24} /> Call 1800-123-4567
        </button>
        <div className="mt-8">
          <button onClick={handleLocation} className="text-primary font-bold flex items-center gap-2 justify-center mx-auto hover:underline">
            <MapPin size={20} /> Share Location for Faster Help
          </button>
          {address && <p className="text-sm text-accent-green mt-2">{address}</p>}
        </div>
      </div>
    </div>
  );
};

export default Emergency;
