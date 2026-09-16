import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Lock, FileText, Bell, ChevronRight, AlertCircle } from 'lucide-react';

const CustomerSettings = () => {
  const navigate = useNavigate();
  
  const settingsItems = [
    { icon: Globe, label: "Language", value: "English" },
    { icon: Bell, label: "Push Notifications", value: "On" },
    { icon: Lock, label: "Privacy Policy", value: "" },
    { icon: FileText, label: "Terms of Service", value: "" }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-slate-100 shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Settings</h1>
      </div>
      
      <div className="p-4 pt-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          {settingsItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition cursor-pointer border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-4">
                <item.icon size={20} className="text-slate-400" />
                <span className="font-semibold text-slate-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && <span className="text-sm font-medium text-slate-400">{item.value}</span>}
                <ChevronRight size={18} className="text-slate-300" />
              </div>
            </div>
          ))}
        </div>

        <button className="w-full bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 text-rose-600 hover:bg-rose-50 transition">
          <AlertCircle size={20} />
          <span className="font-bold">Delete Account</span>
        </button>
      </div>
    </div>
  );
};

export default CustomerSettings;
