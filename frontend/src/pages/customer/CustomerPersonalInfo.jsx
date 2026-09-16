import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CustomerPersonalInfo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-slate-100 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-800">Personal Info</h1>
        </div>
        <button className="text-orange-500 font-bold text-sm">Edit</button>
      </div>
      
      <div className="p-4 pt-6 space-y-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
              <User size={32} />
            </div>
            <div>
              <button className="text-sm font-bold text-orange-500 flex items-center gap-1"><Edit2 size={14} /> Change Photo</button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="flex items-center gap-3 mt-1 text-slate-800 font-medium">
                <User size={18} className="text-slate-400" /> {user?.name || 'Customer User'}
              </div>
            </div>
            <div className="h-px bg-slate-100"></div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
              <div className="flex items-center gap-3 mt-1 text-slate-800 font-medium">
                <Phone size={18} className="text-slate-400" /> {user?.phone || '+91 98765 43210'}
              </div>
            </div>
            <div className="h-px bg-slate-100"></div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="flex items-center gap-3 mt-1 text-slate-800 font-medium">
                <Mail size={18} className="text-slate-400" /> user@example.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPersonalInfo;
