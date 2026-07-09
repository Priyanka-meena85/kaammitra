import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, Star, MapPin, BadgeCheck, ShieldCheck, Volume2 } from 'lucide-react';
import { getDistanceZone } from '../utils/location';
import { speakText } from '../utils/voice';

const WorkerCard = ({ worker }) => {
  const navigate = useNavigate();
  const zone = getDistanceZone(worker.distance);

  const handleCall = (e) => {
    e.stopPropagation();
    window.open(`tel:+91${worker.phone}`, '_self');
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    const text = encodeURIComponent(`Hi ${worker.name}, I need your ${worker.service} service.`);
    window.open(`https://wa.me/91${worker.phone}?text=${text}`, '_blank');
  };

  const handleListen = (e) => {
    e.stopPropagation();
    const text = `${worker.isVerified ? 'Ye worker verified hai.' : ''} Naam ${worker.name}. Service ${worker.service}. Rating ${worker.rating}. Distance ${worker.distance} kilometer. Charge ${worker.expectedCharge} rupaye se shuru.`;
    speakText(text);
  };

  const handleBook = (e) => {
    e.stopPropagation();
    navigate(`/booking/${worker.id}`);
  };

  return (
    <div 
      className="bg-card-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-border-gray overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/worker/${worker.id}`)}
    >
      <div className="p-5 flex flex-col sm:flex-row gap-5 relative">
        {/* Availability Badge */}
        <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-bold ${worker.isAvailable ? 'bg-accent-green/20 text-accent-green-hover' : 'bg-accent-orange/20 text-accent-orange-hover'}`}>
          {worker.isAvailable ? 'Available Now' : 'Busy'}
        </div>

        {/* Photo */}
        <div className="relative flex-shrink-0 mx-auto sm:mx-0">
          <img 
            src={worker.photo} 
            alt={worker.name} 
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-gray-50"
          />
          {worker.isVerified && (
            <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 shadow-md" title="Verified Worker">
              <BadgeCheck size={20} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-navy">{worker.name}</h3>
            {worker.trustScore >= 80 && (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-semibold mx-auto sm:mx-0">
                <ShieldCheck size={14} /> Trust {worker.trustScore}%
              </span>
            )}
          </div>
          <p className="text-primary font-semibold mb-2">{worker.service}</p>
          
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-sm text-text-gray mb-3">
            <div className="flex items-center gap-1 font-medium">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              {worker.rating} <span className="text-border-gray">({worker.totalRatings})</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={16} className="text-border-gray" />
              {worker.distance} km away
            </div>
            <div className={`px-2 py-0.5 rounded-md text-xs font-semibold ${zone.color}`}>
              {zone.label}
            </div>
          </div>
          
          <p className="text-text-gray font-medium">Starts at ₹{worker.expectedCharge}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-4 sm:grid-cols-5 border-t border-border-gray bg-bg-warm divide-x divide-gray-200">
        <button onClick={handleCall} className="p-3 sm:py-4 flex flex-col items-center justify-center gap-1 text-text-gray hover:text-primary hover:bg-bg-soft-blue transition-colors">
          <Phone size={20} />
          <span className="text-xs font-medium">Call</span>
        </button>
        <button onClick={handleWhatsApp} className="p-3 sm:py-4 flex flex-col items-center justify-center gap-1 text-text-gray hover:text-accent-green hover:bg-accent-green/10 transition-colors">
          <MessageCircle size={20} />
          <span className="text-xs font-medium">WhatsApp</span>
        </button>
        <button onClick={handleListen} className="p-3 sm:py-4 flex flex-col items-center justify-center gap-1 text-text-gray hover:text-purple-600 hover:bg-purple-50 transition-colors">
          <Volume2 size={20} />
          <span className="text-xs font-medium">Listen</span>
        </button>
        <button onClick={handleBook} className="col-span-1 sm:col-span-2 p-3 sm:py-4 bg-accent-orange text-white font-bold hover:bg-accent-orange-hover transition-colors flex items-center justify-center h-full w-full">
          Book Now
        </button>
      </div>
    </div>
  );
};

export default WorkerCard;
