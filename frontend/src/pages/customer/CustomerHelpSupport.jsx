import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, PhoneCall, ChevronRight, HelpCircle } from 'lucide-react';

const CustomerHelpSupport = () => {
  const navigate = useNavigate();

  const faqs = [
    "How to cancel a booking?",
    "How is the final price calculated?",
    "What if the worker damages something?",
    "How do I apply a promo code?"
  ];
  
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-slate-100 shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Help & Support</h1>
      </div>
      
      <div className="p-4 pt-6 space-y-6">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">Contact Us</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition cursor-pointer border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                  <MessageCircle size={20} />
                </div>
                <span className="font-semibold text-slate-700">Chat with Support</span>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </div>
            <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <PhoneCall size={20} />
                </div>
                <span className="font-semibold text-slate-700">Call Support</span>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">Frequently Asked Questions</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {faqs.map((faq, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition cursor-pointer border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <HelpCircle size={18} className="text-slate-400" />
                  <span className="font-medium text-slate-700">{faq}</span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHelpSupport;
