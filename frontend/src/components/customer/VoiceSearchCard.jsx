import React from 'react';
import { Mic, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VoiceSearchCard = () => {
  const navigate = useNavigate();

  return (
    <div className="relative group cursor-text" onClick={() => navigate('/customer/search')}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur opacity-10 group-hover:opacity-30 transition duration-500"></div>
      <div className="relative bg-white flex items-center justify-between p-2 pl-6 rounded-full shadow-md border border-slate-100 hover:border-orange-200 transition-colors">
        <div className="flex items-center space-x-3 text-slate-400">
          <Search size={22} className="text-orange-400" />
          <span className="text-base font-medium">What do you need help with?</span>
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigate('/customer/search/voice');
          }}
          className="w-12 h-12 bg-orange-50 hover:bg-orange-100 rounded-full flex items-center justify-center transition-transform hover:scale-105 relative"
        >
          <div className="absolute inset-0 bg-orange-400 rounded-full opacity-20 animate-ping"></div>
          <Mic className="w-5 h-5 text-orange-500 relative z-10" />
        </button>
      </div>
    </div>
  );
};

export default VoiceSearchCard;
