import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { User } from 'lucide-react'; // Placeholder

const CustomerMessages = () => {
  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-slate-100 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
        <button className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
          <Search size={20} />
        </button>
      </div>

      <div className="px-2">
        <Link to="/customer/messages/chat-1" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition border-b border-slate-50 last:border-0 mt-2">
          <div className="relative">
            <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
              <User size={24} />
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-baseline mb-0.5">
              <h3 className="font-bold text-slate-800 truncate">Rahul Sharma</h3>
              <span className="text-xs text-orange-500 font-bold ml-2 shrink-0">10:45 AM</span>
            </div>
            <p className="text-sm text-slate-500 truncate font-medium">I'm reaching in 5 minutes, sir.</p>
          </div>
          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0">
            1
          </div>
        </Link>
        
        <Link to="/customer/messages/chat-2" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition border-b border-slate-50 last:border-0">
          <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
            <User size={24} />
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-baseline mb-0.5">
              <h3 className="font-bold text-slate-800 truncate">Amit Verma</h3>
              <span className="text-xs text-slate-400 ml-2 shrink-0">Yesterday</span>
            </div>
            <p className="text-sm text-slate-500 truncate">Thank you for the booking.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CustomerMessages;
