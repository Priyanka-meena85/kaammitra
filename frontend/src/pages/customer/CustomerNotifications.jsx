import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CalendarCheck, MessageSquare, Star } from 'lucide-react';

const CustomerNotifications = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-slate-100 shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Notifications</h1>
      </div>
      
      <div className="p-4 flex flex-col gap-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 mt-2">Today</div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
            <CalendarCheck size={18} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Booking Confirmed</h3>
            <p className="text-slate-500 text-sm mt-0.5 leading-snug">Rahul Sharma has accepted your Plumbing request for today at 4 PM.</p>
            <span className="text-[10px] text-slate-400 font-bold mt-2 block">10:30 AM</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-4">
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
            <MessageSquare size={18} className="text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">New Message</h3>
            <p className="text-slate-500 text-sm mt-0.5 leading-snug">"I'm reaching in 5 minutes, sir."</p>
            <span className="text-[10px] text-slate-400 font-bold mt-2 block">10:45 AM</span>
          </div>
        </div>
        
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 mt-4">Yesterday</div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-4 opacity-75">
          <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
            <Star size={18} className="text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Review Pending</h3>
            <p className="text-slate-500 text-sm mt-0.5 leading-snug">How was your electrical service with Amit Verma? Leave a review to help others.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerNotifications;
