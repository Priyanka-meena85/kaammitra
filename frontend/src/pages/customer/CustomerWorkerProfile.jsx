import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, BadgeCheck, MessageSquare, Phone, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { User } from 'lucide-react'; // Placeholder for worker image
import { getWorkerDetails } from '../../api/customerApi';
import toast from 'react-hot-toast';

const CustomerWorkerProfile = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        setLoading(true);
        const res = await getWorkerDetails(workerId);
        if (res.success && res.data) {
          setWorker(res.data);
        } else {
          toast.error("Worker not found");
          navigate(-1);
        }
      } catch (err) {
        console.error("Failed to load worker details", err);
        if (!err.isWakingUp) {
          toast.error("Failed to load worker details");
          navigate(-1);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (workerId) {
      fetchWorker();
    }
  }, [workerId, navigate]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center pb-24 text-slate-400">
        <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
        <p className="font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!worker) return null;

  return (
    <div className="bg-slate-50 min-h-screen pb-24 md:pb-8">
      {/* Header Image & Back Button */}
      <div className="relative h-64 md:h-80 bg-slate-200 overflow-hidden">
        <button onClick={() => navigate(-1)} className="absolute top-6 left-4 md:top-8 md:left-8 p-2 bg-white/50 backdrop-blur-md rounded-full text-slate-800 z-10 hover:bg-white/70 transition">
          <ArrowLeft size={24} />
        </button>
        {worker.profilePhotoUrl ? (
          <img src={worker.profilePhotoUrl} alt={worker.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-300 flex items-center justify-center text-slate-400">
            <User size={64} className="md:w-24 md:h-24" />
          </div>
        )}
      </div>

      <div className="px-4 -mt-8 relative z-10 max-w-5xl mx-auto md:-mt-16 md:grid md:grid-cols-3 md:gap-8 md:items-start">
        
        {/* Left Column */}
        <div className="md:col-span-1 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                {worker.name}
                {worker.isVerified && <BadgeCheck size={20} className="text-orange-500" />}
              </h1>
              <p className="text-orange-500 font-medium">{worker.services?.[0] || 'Service Professional'}</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                <Star size={14} className="fill-amber-400 stroke-amber-400" />
                <span className="text-sm font-bold text-amber-700">{worker.averageRating || 0}</span>
              </div>
              <span className="text-xs text-slate-400 mt-1">{worker.totalReviews || 0} reviews</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm text-slate-600">
            <span className="flex items-center gap-1 font-medium"><MapPin size={16} className="text-slate-400" /> {worker.city || 'Jaipur'}, India</span>
            <span className={`flex items-center gap-1 font-medium ${worker.isAvailable ? 'text-emerald-600' : 'text-slate-500'}`}>
              <span className={`w-2 h-2 rounded-full ${worker.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`}></span> 
              {worker.isAvailable ? 'Available Today' : 'Not Available'}
            </span>
          </div>
        </div>
        {/* Desktop Actions */}
        <div className="hidden md:flex flex-col gap-3 mt-4">
          <button 
            onClick={() => navigate(`/customer/booking/new/${worker._id}`)}
            disabled={!worker.isAvailable}
            className={`w-full py-3.5 font-bold rounded-xl shadow-sm transition ${worker.isAvailable ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
          >
            {worker.isAvailable ? 'Book Now' : 'Not Available'}
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate(`/customer/messages/${worker._id}`)}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl transition font-medium"
            >
              <MessageSquare size={18} /> Message
            </button>
            <a 
              href={`tel:${worker.phone}`}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl transition font-medium"
            >
              <Phone size={18} /> Call
            </a>
          </div>
        </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-6 mt-6 md:mt-0">
        {/* About Section */}
        <div className="mt-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3">About</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Professional {worker.services?.[0]?.toLowerCase() || 'worker'} with {worker.experience || 'several'} years of experience. 
            Reliable, punctual, and ensures complete cleanup after work.
          </p>
        </div>

        {/* Trust & Safety Section */}
        <div className="mt-6 bg-orange-50/50 rounded-3xl p-6 border border-orange-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-orange-500" />
            Trust & Safety
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <CheckCircle2 size={18} className={`shrink-0 ${worker.isVerified ? 'text-emerald-500' : 'text-slate-400'}`} /> 
              {worker.isVerified ? 'Identity Verified (Aadhaar)' : 'Identity Verification Pending'}
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> Background Checked
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> {worker.completedJobs || 'Multiple'} Bookings Completed
            </li>
          </ul>
        </div>
        </div>
      </div>

      {/* Sticky Bottom Actions (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-50 flex gap-3 max-w-md mx-auto pb-safe">
        <button 
          onClick={() => navigate(`/customer/messages/${worker._id}`)}
          className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition shrink-0"
        >
          <MessageSquare size={20} />
        </button>
        <a 
          href={`tel:${worker.phone}`}
          className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition shrink-0"
        >
          <Phone size={20} />
        </a>
        <button 
          onClick={() => navigate(`/customer/booking/new/${worker._id}`)}
          disabled={!worker.isAvailable}
          className={`flex-grow font-bold rounded-xl shadow-md transition ${worker.isAvailable ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
        >
          {worker.isAvailable ? 'Book Now' : 'Not Available'}
        </button>
      </div>
    </div>
  );
};

export default CustomerWorkerProfile;
