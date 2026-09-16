import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MoreVertical, Send, Paperclip } from 'lucide-react';
import { User } from 'lucide-react';

const CustomerChat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-100 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 leading-tight">Rahul Sharma</h3>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wide">Online</p>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><Phone size={20} /></button>
          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><MoreVertical size={20} /></button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4 pb-20">
        <div className="text-center">
          <span className="bg-slate-200/50 text-slate-500 text-xs px-3 py-1 rounded-full font-medium">Today</span>
        </div>
        
        {/* Worker Message */}
        <div className="flex gap-2 max-w-[85%]">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0 mt-auto flex items-center justify-center text-slate-400">
            <User size={16} />
          </div>
          <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 text-sm text-slate-700">
            Hello sir, I have started from my location. It will take around 15 minutes.
            <div className="text-[10px] text-slate-400 text-right mt-1">10:30 AM</div>
          </div>
        </div>
        
        {/* Customer Message */}
        <div className="flex gap-2 max-w-[85%] self-end flex-row-reverse">
          <div className="bg-orange-500 text-white p-3 rounded-2xl rounded-br-none shadow-sm text-sm">
            Okay, please call me when you reach the gate.
            <div className="text-[10px] text-orange-200 text-right mt-1">10:35 AM</div>
          </div>
        </div>
        
        {/* Worker Message */}
        <div className="flex gap-2 max-w-[85%]">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0 mt-auto flex items-center justify-center text-slate-400">
            <User size={16} />
          </div>
          <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 text-sm text-slate-700">
            Sure. I'm reaching in 5 minutes.
            <div className="text-[10px] text-slate-400 text-right mt-1">10:45 AM</div>
          </div>
        </div>
      </div>

      {/* Quick Replies */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide max-w-md mx-auto z-10 bg-gradient-to-t from-slate-50 to-transparent pt-4">
        <span className="bg-white border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm">Are you coming today?</span>
        <span className="bg-white border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm">Please call me.</span>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex gap-2 max-w-md mx-auto pb-safe z-20 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
        <button className="p-3 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full shrink-0">
          <Paperclip size={20} />
        </button>
        <input 
          type="text" 
          placeholder="Message Rahul..." 
          className="flex-grow bg-slate-100 border-none rounded-full px-4 focus:ring-0 text-sm text-slate-700 placeholder-slate-400"
        />
        <button className="p-3 bg-orange-500 text-white rounded-full shrink-0 shadow-md hover:bg-blue-700 transition">
          <Send size={20} className="-ml-0.5" />
        </button>
      </div>
    </div>
  );
};

export default CustomerChat;
