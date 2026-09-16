import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, CalendarCheck, MessageSquare, User } from 'lucide-react';

const CustomerBottomNav = () => {
  const navItems = [
    { name: 'Overview', path: '/customer', icon: Home, exact: true },
    { name: 'Search', path: '/customer/search', icon: Search },
    { name: 'Bookings', path: '/customer/bookings', icon: CalendarCheck },
    { name: 'Messages', path: '/customer/messages', icon: MessageSquare },
    { name: 'Profile', path: '/customer/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} className={isActive ? 'fill-orange-50 stroke-orange-500' : 'stroke-current'} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-medium ${isActive ? 'text-orange-500 font-bold' : ''}`}>
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default CustomerBottomNav;
