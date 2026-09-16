import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Home, Briefcase, Plus } from 'lucide-react';

const CustomerSavedAddresses = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-slate-100 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-800">Saved Addresses</h1>
        </div>
        <button className="text-orange-500 font-bold text-sm flex items-center gap-1"><Plus size={16} /> Add</button>
      </div>
      
      <div className="p-4 pt-6 space-y-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex gap-4 items-start">
          <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center shrink-0">
            <Home size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Home</h3>
            <p className="text-sm text-slate-500 mt-1 leading-snug">123 Main St, Apartment 4B<br/>Jaipur, Rajasthan 302001</p>
            <div className="flex gap-4 mt-3">
              <button className="text-xs font-bold text-orange-500 uppercase tracking-wider">Edit</button>
              <button className="text-xs font-bold text-rose-600 uppercase tracking-wider">Delete</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex gap-4 items-start">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <Briefcase size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Work</h3>
            <p className="text-sm text-slate-500 mt-1 leading-snug">456 Tech Park, Tower B<br/>Jaipur, Rajasthan 302022</p>
            <div className="flex gap-4 mt-3">
              <button className="text-xs font-bold text-orange-500 uppercase tracking-wider">Edit</button>
              <button className="text-xs font-bold text-rose-600 uppercase tracking-wider">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSavedAddresses;
