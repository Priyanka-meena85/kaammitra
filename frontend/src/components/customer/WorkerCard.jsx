import React from 'react';
import { Star, MapPin, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WorkerCard = ({ id, name, service, rating, reviews, distance, price, available }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-4 mb-4">
      <div className="w-20 h-20 rounded-xl bg-slate-200 overflow-hidden shrink-0">
        {/* Placeholder image */}
        <div className="w-full h-full bg-slate-300 flex items-center justify-center text-slate-400">
          <User size={32} />
        </div>
      </div>
      
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-1">
              {name} <BadgeCheck size={16} className="text-orange-500" />
            </h3>
            <p className="text-xs font-medium text-slate-500">{service}</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
            <Star size={12} className="fill-amber-400 stroke-amber-400" />
            <span className="text-xs font-bold text-amber-700">{rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1"><MapPin size={12} /> {distance} km</span>
          <span className={available ? 'text-emerald-600 font-medium flex items-center gap-1' : 'text-slate-400 flex items-center gap-1'}>
            <span className={`w-1.5 h-1.5 rounded-full ${available ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            {available ? 'Available' : 'Busy'}
          </span>
        </div>

        <div className="flex justify-between items-end mt-3">
          <div>
            <span className="text-[10px] text-slate-400">Starting</span>
            <p className="font-bold text-slate-800">₹{price}</p>
          </div>
          <button 
            onClick={() => navigate(`/customer/search/worker/${id}`)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

// Assuming User icon was meant to be imported
import { User } from 'lucide-react';

export default WorkerCard;
