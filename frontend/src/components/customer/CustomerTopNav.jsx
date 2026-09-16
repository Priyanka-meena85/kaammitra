import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, Search, CalendarCheck, MessageSquare, User, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CustomerTopNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/customer', icon: Home, exact: true },
    { name: 'Search', path: '/customer/search', icon: Search },
    { name: 'Bookings', path: '/customer/bookings', icon: CalendarCheck },
    { name: 'Messages', path: '/customer/messages', icon: MessageSquare },
  ];

  return (
    <div className="hidden md:block sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo / Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/customer" className="flex items-center">
              <img src="/logo.png" alt="KaamMitra Logo" className="h-10 w-auto object-contain" />
            </Link>
          </div>

          {/* Center Navigation Links */}
          <nav className="flex space-x-8">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-orange-500 text-orange-500'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={18} className={`mr-2 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <Link to="/customer/notifications" className="text-slate-500 hover:text-orange-500 transition p-2 rounded-full hover:bg-slate-50">
              <Bell size={20} />
            </Link>
            
            <div className="h-6 w-px bg-slate-200"></div>

            <Link to="/customer/profile" className="flex items-center gap-2 text-slate-700 hover:text-orange-500 transition group">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:border-orange-200">
                <User size={16} className="text-slate-500 group-hover:text-orange-500" />
              </div>
              <span className="text-sm font-medium hidden lg:block">{user?.name || 'My Profile'}</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600 transition p-2 rounded-full hover:bg-red-50 ml-2"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTopNav;
