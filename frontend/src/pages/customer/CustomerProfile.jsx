import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut, ChevronRight, MapPin, Star, Heart, CalendarCheck, HelpCircle, Shield, FileText, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User } from 'lucide-react';

const CustomerProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuGroups = [
    {
      title: "My Activity",
      items: [
        { icon: CalendarCheck, label: "My Bookings", color: "text-orange-500", bg: "bg-orange-50", link: "/customer/bookings" },
        { icon: Heart, label: "Trusted Workers", color: "text-rose-500", bg: "bg-rose-50", link: "/customer/profile/trusted-workers" },
        { icon: Star, label: "My Reviews", color: "text-amber-500", bg: "bg-amber-50", link: "/customer/profile/reviews" }
      ]
    },
    {
      title: "My Details",
      items: [
        { icon: MapPin, label: "Saved Addresses", color: "text-emerald-500", bg: "bg-emerald-50", link: "/customer/profile/addresses" },
        { icon: User, label: "Personal Information", color: "text-indigo-500", bg: "bg-indigo-50", link: "/customer/profile/personal" }
      ]
    },
    {
      title: "Settings & Support",
      items: [
        { icon: Bell, label: "Notifications", color: "text-slate-500", bg: "bg-slate-100", link: "/customer/notifications" },
        { icon: HelpCircle, label: "Help & Support", color: "text-cyan-500", bg: "bg-cyan-50", link: "/customer/profile/help" },
        { icon: Settings, label: "Settings", color: "text-slate-600", bg: "bg-slate-100", link: "/customer/profile/settings" }
      ]
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header Profile */}
      <div className="bg-white px-4 pt-8 pb-6 border-b border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{user?.name || 'Customer'}</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">{user?.phone || '+91 98765 43210'}</p>
            <div className="mt-2 inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              Consumer Account
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">{group.title}</h3>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              {group.items.map((item, i) => (
                <Link 
                  key={i} 
                  to={item.link}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg}`}>
                      <item.icon size={20} className={item.color} />
                    </div>
                    <span className="font-semibold text-slate-700">{item.label}</span>
                  </div>
                  <ChevronRight size={20} className="text-slate-300" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={handleLogout}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold py-4 rounded-2xl transition"
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default CustomerProfile;
