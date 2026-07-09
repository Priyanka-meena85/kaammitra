import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Volume2 } from 'lucide-react';

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  const IconComponent = Icons[service.icon] || Icons.HelpCircle;

  const handleListen = (e) => {
    e.stopPropagation(); // Prevent card click
    const text = `Ye service ${service.hindiName} ke liye hai. Book Now dabakar worker dekh sakte hain.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Set to Hindi
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-card-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer border border-border-gray hover:border-primary/40 hover:-translate-y-2 group overflow-hidden relative">
      
      {/* Optional Badge */}
      {service.badge && (
        <div className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full ${
          service.badge === 'Emergency' ? 'bg-accent-orange/20 text-accent-orange-hover' : 'bg-accent-green/20 text-accent-green-hover'
        }`}>
          {service.badge}
        </div>
      )}

      {/* Top Gradient Area */}
      <div className="bg-gradient-to-b from-blue-50/50 to-transparent pt-8 pb-4 px-6 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-bg-soft-blue text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
          <IconComponent size={40} />
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-1 w-full">
          <h3 className="text-xl font-bold text-navy">{service.name}</h3>
          <button 
            onClick={handleListen}
            className="p-1.5 bg-bg-soft-blue text-primary rounded-full hover:bg-blue-200 transition-colors"
            title="Listen in Hindi"
          >
            <Volume2 size={16} />
          </button>
        </div>
        <h4 className="text-lg font-semibold text-orange-600 mb-2">{service.hindiName}</h4>
        
        <p className="text-sm text-text-gray line-clamp-2">{service.description}</p>
      </div>

      {/* Details Area */}
      <div className="px-6 py-4 bg-bg-warm border-t border-border-gray flex-grow flex flex-col justify-between">
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-text-gray">Starting price:</span>
            <span className="text-navy font-bold">₹{service.price}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-text-gray">Nearby workers:</span>
            <span className="text-accent-green font-bold">{service.workerCount}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-text-gray">Response time:</span>
            <span className="text-primary font-bold">{service.eta}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-auto">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/workers?service=${encodeURIComponent(service.name)}`);
            }}
            className="flex-1 py-3 px-2 bg-card-white text-primary border border-primary/30 font-bold rounded-xl hover:bg-bg-soft-blue transition-colors text-sm"
          >
            View Workers
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/workers?service=${encodeURIComponent(service.name)}&action=book`);
            }}
            className="flex-1 py-3 px-2 bg-accent-orange text-white font-bold rounded-xl hover:bg-accent-orange-hover shadow-md hover:shadow-lg transition-all text-sm"
          >
            Book Now
          </button>
        </div>
      </div>

    </div>
  );
};

export default ServiceCard;
