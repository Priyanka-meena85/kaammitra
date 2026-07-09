import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="flex items-center mb-4">
            <img src="/logo.png" alt="KaamMitra Logo" className="h-10 w-auto bg-white rounded p-1 object-contain" />
          </Link>
          <p className="text-border-gray mb-4">
            Find verified nearby workers for home, shop, and business services easily by voice, call, or simple booking.
          </p>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4 text-gray-200">Services</h4>
          <ul className="space-y-2 text-border-gray">
            <li><Link to="/workers?service=Electrician" className="hover:text-blue-400">Electrician (बिजली मिस्त्री)</Link></li>
            <li><Link to="/workers?service=Plumber" className="hover:text-blue-400">Plumber (प्लम्बर)</Link></li>
            <li><Link to="/workers?service=Cleaner" className="hover:text-blue-400">Cleaner (सफाई वाला)</Link></li>
            <li><Link to="/services" className="hover:text-blue-400 text-primary">View All Services →</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4 text-gray-200">Company</h4>
          <ul className="space-y-2 text-border-gray">
            <li><Link to="/how-it-works" className="hover:text-blue-400">How it Works</Link></li>
            <li><Link to="/worker-onboarding" className="hover:text-blue-400">Become a Worker</Link></li>
            <li><Link to="/contact" className="hover:text-blue-400">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4 text-gray-200">Emergency</h4>
          <p className="text-border-gray mb-4">Need urgent help?</p>
          <Link to="/emergency" className="inline-block bg-accent-orange hover:bg-accent-orange text-white px-6 py-2 rounded-lg font-medium transition shadow-lg">
            Get Emergency Help
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-text-gray">
        <p>&copy; {new Date().getFullYear()} KaamMitra. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
