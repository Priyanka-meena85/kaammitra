import React from 'react';
import { Mic, Search, CheckCircle, PhoneCall, Calendar } from 'lucide-react';

const HowItWorks = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-navy mb-4">How KaamMitra Works</h1>
        <p className="text-xl text-text-gray">Simple, trusted, and fast way to get things done.</p>
      </div>

      {/* For Customers */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-primary mb-8 border-b pb-4">For Customers</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-card-white p-8 rounded-2xl shadow-sm border border-border-gray">
            <div className="w-16 h-16 bg-bg-soft-blue text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Mic size={32} />
            </div>
            <h3 className="text-xl font-bold text-navy mb-3">1. Tell us what you need</h3>
            <p className="text-text-gray">Use Voice Search or type the service you are looking for (e.g. Electrician).</p>
          </div>
          <div className="bg-card-white p-8 rounded-2xl shadow-sm border border-border-gray">
            <div className="w-16 h-16 bg-bg-soft-blue text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-navy mb-3">2. Choose a Worker</h3>
            <p className="text-text-gray">See distance, ratings, and pricing. Listen to their profile in Hindi.</p>
          </div>
          <div className="bg-card-white p-8 rounded-2xl shadow-sm border border-border-gray">
            <div className="w-16 h-16 bg-bg-soft-blue text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <PhoneCall size={32} />
            </div>
            <h3 className="text-xl font-bold text-navy mb-3">3. Connect & Get it Done</h3>
            <p className="text-text-gray">Call directly, WhatsApp, or book them through the app for a specific time.</p>
          </div>
        </div>
      </div>

      {/* For Workers */}
      <div>
        <h2 className="text-3xl font-bold text-orange-500 mb-8 border-b pb-4">For Workers (वर्कर के लिए)</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-card-white p-8 rounded-2xl shadow-sm border border-border-gray">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-navy mb-3">1. Register & Verify</h3>
            <p className="text-text-gray">Sign up and upload ID proof to get the verified badge and build trust.</p>
          </div>
          <div className="bg-card-white p-8 rounded-2xl shadow-sm border border-border-gray">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar size={32} />
            </div>
            <h3 className="text-xl font-bold text-navy mb-3">2. Get Nearby Jobs</h3>
            <p className="text-text-gray">Receive calls, WhatsApp messages, or bookings directly from customers.</p>
          </div>
          <div className="bg-card-white p-8 rounded-2xl shadow-sm border border-border-gray">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-navy mb-3">3. Earn & Grow</h3>
            <p className="text-text-gray">Get paid directly by customers. Good ratings mean more jobs and higher trust score.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
