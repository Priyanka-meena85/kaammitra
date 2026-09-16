import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';

const AdminNavbar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = (path) => `font-medium text-sm lg:text-base whitespace-nowrap transition-colors ${location.pathname === path ? 'text-primary' : 'text-text-gray hover:text-primary'}`;

  return (
    <nav className="sticky top-0 z-50 bg-card-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/admin" className="flex items-center">
              <img src="/logo.png" alt="KaamMitra Logo" className="h-12 w-auto object-contain" />
              <span className="ml-2 font-extrabold text-navy text-lg hidden sm:block">Admin</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex flex-1 justify-end gap-4 lg:gap-6 items-center min-w-0">
            <Link to="/admin" className={linkClass('/admin')}>Overview</Link>
            <Link to="/admin/analytics" className={linkClass('/admin/analytics')}>Analytics</Link>
            <Link to="/admin/reports" className={linkClass('/admin/reports')}>Reports</Link>
            <Link to="/admin/trust-safety" className={linkClass('/admin/trust-safety')}>Trust & Safety</Link>
            
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <button onClick={logout} className="text-text-gray hover:text-red-500 font-medium flex items-center gap-1">
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsOpen(!isOpen)} className="text-text-gray hover:text-primary">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-card-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="px-3 py-2 flex items-center">
              <NotificationBell />
            </div>
            <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-text-gray font-medium hover:bg-bg-warm rounded-md">Overview</Link>
            <Link to="/admin/analytics" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-text-gray font-medium hover:bg-bg-warm rounded-md">Analytics</Link>
            <button onClick={() => { logout(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 text-red-500 font-medium hover:bg-bg-warm rounded-md">Logout</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;
