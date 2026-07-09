import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, Languages } from 'lucide-react';
import SimpleModeToggle from './SimpleModeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('en');

  const toggleLang = () => setLang(lang === 'en' ? 'hi' : 'en');

  return (
    <nav className="sticky top-0 z-50 bg-card-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="KaamMitra Logo" className="h-12 w-auto object-contain" />
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-text-gray hover:text-primary font-medium">{lang === 'hi' ? 'होम' : 'Home'}</Link>
            <Link to="/services" className="text-text-gray hover:text-primary font-medium">{lang === 'hi' ? 'सर्विसेज' : 'Services'}</Link>
            <Link to="/how-it-works" className="text-text-gray hover:text-primary font-medium">{lang === 'hi' ? 'कैसे काम करता है' : 'How it Works'}</Link>
            <Link to="/worker-register" className="text-text-gray hover:text-primary font-medium">{lang === 'hi' ? 'वर्कर बनें' : 'Become Worker'}</Link>
            
            <SimpleModeToggle />

            <button onClick={toggleLang} className="flex items-center gap-1 text-text-gray hover:text-primary">
              <Languages size={20} />
              <span className="text-sm font-bold">{lang === 'en' ? 'HI' : 'EN'}</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-text-gray hover:text-primary font-medium flex items-center gap-1">
                <User size={18} />
                {lang === 'hi' ? 'लॉगिन' : 'Login'}
              </Link>
              <Link to="/register" className="bg-orange-500 text-white px-4 py-2 rounded-full font-medium hover:bg-orange-600 transition shadow-md">
                {lang === 'hi' ? 'रजिस्टर' : 'Register'}
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleLang} className="flex items-center gap-1 text-text-gray hover:text-primary">
              <Languages size={20} />
              <span className="text-sm font-bold">{lang === 'en' ? 'HI' : 'EN'}</span>
            </button>
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
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-text-gray font-medium hover:bg-bg-warm rounded-md">Home</Link>
            <Link to="/services" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-text-gray font-medium hover:bg-bg-warm rounded-md">Services</Link>
            <Link to="/how-it-works" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-text-gray font-medium hover:bg-bg-warm rounded-md">How it Works</Link>
            <Link to="/worker-register" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-text-gray font-medium hover:bg-bg-warm rounded-md">Become Worker</Link>
            <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-text-gray font-medium hover:bg-bg-warm rounded-md">Login</Link>
            <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-orange-500 font-medium hover:bg-bg-warm rounded-md">Register</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
