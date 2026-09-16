import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';

const CustomerMyReviews = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-slate-100 shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">My Reviews</h1>
      </div>
      
      <div className="p-4 pt-6 space-y-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-slate-800">Rahul Sharma</h3>
              <p className="text-xs text-slate-500 font-medium">Plumbing Service • 2 weeks ago</p>
            </div>
            <div className="flex gap-0.5 text-amber-400">
              <Star size={14} className="fill-amber-400" />
              <Star size={14} className="fill-amber-400" />
              <Star size={14} className="fill-amber-400" />
              <Star size={14} className="fill-amber-400" />
              <Star size={14} className="fill-amber-400" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-2">Rahul was very professional and fixed the leak quickly. Left the place clean.</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-slate-800">Amit Verma</h3>
              <p className="text-xs text-slate-500 font-medium">Electrical Repair • 1 month ago</p>
            </div>
            <div className="flex gap-0.5 text-amber-400">
              <Star size={14} className="fill-amber-400" />
              <Star size={14} className="fill-amber-400" />
              <Star size={14} className="fill-amber-400" />
              <Star size={14} className="fill-amber-400" />
              <Star size={14} className="text-slate-200" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-2">Good work on the fan installation, but arrived 15 mins late.</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerMyReviews;
