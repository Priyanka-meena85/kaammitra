import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, Star, MapPin, BadgeCheck, ShieldCheck, CheckCircle2, Clock, CalendarCheck, Info, MessageSquare } from 'lucide-react';
import { workers } from '../data/workers';
import { getDistanceZone } from '../utils/location';
import { speakText } from '../utils/voice';

const WorkerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const worker = workers.find(w => w.id === id);

  if (!worker) {
    return <div className="p-20 text-center text-2xl font-bold">Worker not found!</div>;
  }

  const zone = getDistanceZone(worker.distance);

  const handleCall = () => window.open(`tel:+91${worker.phone}`, '_self');
  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Hi ${worker.name}, I need your ${worker.service} service.`);
    window.open(`https://wa.me/91${worker.phone}?text=${text}`, '_blank');
  };
  const handleListen = () => {
    const text = `${worker.isVerified ? 'Ye worker verified hai.' : ''} Naam ${worker.name}. Service ${worker.service}. Rating ${worker.rating}. Distance ${worker.distance} kilometer. Charge ${worker.expectedCharge} rupaye se shuru.`;
    speakText(text);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="text-text-gray hover:text-primary font-medium mb-6 flex items-center gap-1">
        ← Back to list
      </button>

      {/* Main Profile Header */}
      <div className="bg-card-white rounded-3xl shadow-sm border border-border-gray overflow-hidden mb-8">
        <div className="bg-primary h-32 w-full relative">
          <div className="absolute -bottom-16 left-8">
            <img 
              src={worker.photo} 
              alt={worker.name} 
              className="w-32 h-32 rounded-full object-cover border-4 border-white bg-card-white shadow-md"
            />
          </div>
        </div>
        
        <div className="pt-20 px-8 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-extrabold text-navy">{worker.name}</h1>
                {worker.isVerified && (
                  <BadgeCheck size={28} className="text-primary" title="Verified Worker" />
                )}
              </div>
              <p className="text-xl font-semibold text-primary mb-4">{worker.service}</p>
              
              <div className="flex flex-wrap gap-4 text-sm font-medium text-text-gray mb-6">
                <div className="flex items-center gap-1">
                  <Star size={18} className="text-yellow-400 fill-yellow-400" />
                  {worker.rating} ({worker.totalRatings} Reviews)
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={18} className="text-border-gray" />
                  {worker.distance} km away
                </div>
                <div className="flex items-center gap-1">
                  <CalendarCheck size={18} className="text-border-gray" />
                  {worker.completedJobs}+ Jobs Done
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button 
                onClick={() => navigate(`/booking/${worker.id}`)}
                className="bg-accent-orange text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-accent-orange-hover hover:-translate-y-1 transition-all"
              >
                Book Now
              </button>
              <button 
                onClick={handleListen}
                className="bg-bg-soft-blue text-text-gray px-6 py-3 rounded-xl font-bold hover:bg-border-gray transition-all flex items-center justify-center gap-2"
              >
                Listen Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="md:col-span-2 space-y-8">
          {/* About / Stats */}
          <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6">
            <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
              <Info size={20} className="text-primary" /> Profile Details
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-text-gray mb-1">Expected Charge</p>
                <p className="text-lg font-bold text-navy">₹{worker.expectedCharge} / visit</p>
              </div>
              <div>
                <p className="text-sm text-text-gray mb-1">Experience</p>
                <p className="text-lg font-bold text-navy">{worker.experience} Years</p>
              </div>
              <div>
                <p className="text-sm text-text-gray mb-1">Availability</p>
                <p className={`text-lg font-bold ${worker.isAvailable ? 'text-accent-green' : 'text-accent-orange'}`}>
                  {worker.isAvailable ? 'Available Now' : 'Busy'}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-gray mb-1">Distance Zone</p>
                <p className={`text-lg font-bold ${zone.color.split(' ')[1]}`}>
                  {zone.label}
                </p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6">
            <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-primary" /> Specialized Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {worker.skills.map((skill, index) => (
                <span key={index} className="bg-bg-soft-blue text-primary-hover px-4 py-2 rounded-lg font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Contact & Trust */}
        <div className="space-y-6">
          <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6">
            <h2 className="text-lg font-bold text-navy mb-4">Contact Directly</h2>
            <div className="space-y-3">
              <button onClick={handleCall} className="w-full flex items-center justify-center gap-2 bg-bg-soft-blue hover:bg-border-gray text-navy py-3 rounded-xl font-bold transition-colors">
                <Phone size={20} /> Call {worker.phone}
              </button>
              <button onClick={handleWhatsApp} className="w-full flex items-center justify-center gap-2 bg-accent-green/10 hover:bg-accent-green/20 text-accent-green-hover py-3 rounded-xl font-bold transition-colors border border-green-200">
                <MessageCircle size={20} /> Message on WhatsApp
              </button>
              <button onClick={() => navigate(`/chat/${worker.id}`)} className="w-full flex items-center justify-center gap-2 bg-bg-soft-blue hover:bg-bg-soft-blue text-primary-hover py-3 rounded-xl font-bold transition-colors border border-primary/30">
                <MessageSquare size={20} /> App Chat
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm border border-amber-100 p-6 text-center">
            <ShieldCheck size={40} className="text-amber-500 mx-auto mb-2" />
            <h2 className="text-lg font-bold text-amber-900 mb-1">Trust Score: {worker.trustScore}%</h2>
            <p className="text-sm text-amber-700">Based on customer ratings, verification, and completed jobs on KaamMitra.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
