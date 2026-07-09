import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Phone, MessageCircle, ShieldCheck, Clock, Zap } from 'lucide-react';
import { calculateMatchingScore, getMatchingBadge } from '../utils/matchingScore';
import { useSimpleMode } from '../context/SimpleModeContext';
import { speakText } from '../utils/speech';
import { Volume2 } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const WorkerCard = ({ worker }) => {
  const { user } = useAuth();
  const { isSimpleMode } = useSimpleMode();
  
  // Normalize old dummy fields vs new backend fields safely
  const id = worker._id || worker.id;
  const name = worker.name || 'Worker Name';
  const service = worker.service || (worker.services && worker.services[0]) || 'Service';
  const price = worker.expectedCharge || worker.startingPrice || 0;
  
  const handleCallWorker = async (e) => {
    e.stopPropagation();
    try {
      await api.post('/leads', { workerId: worker._id || worker.id, customerId: user?._id || null, workerName: worker.name, workerPhone: worker.phone, service: worker.service || worker.services?.[0], source: 'call', pageSource: 'worker-card' });
    } catch(e) {}
    window.location.href = `tel:${worker.phone}`;
  };

  const handleWhatsAppWorker = async (e) => {
    e.stopPropagation();
    try {
      await api.post('/leads', { workerId: worker._id || worker.id, customerId: user?._id || null, workerName: worker.name, workerPhone: worker.phone, service: worker.service || worker.services?.[0], source: 'whatsapp', pageSource: 'worker-card' });
    } catch(e) {}
    const msg = encodeURIComponent(`Namaste, mujhe ${worker.service || 'service'} chahiye. Kya aap available hain?`);
    window.location.href = `https://wa.me/91${worker.phone}?text=${msg}`;
  };

  const handleListen = (e) => {
    e.stopPropagation();
    speakText(`Ye worker ${worker.name} hain. Service ${worker.service || 'general'}. Rating ${worker.rating || 0}. Distance ${worker.distance || 0} kilometer. Charge ${worker.expectedCharge || 300} rupaye se shuru.`);
  };

  const isVerified = worker.isVerified || worker.verificationStatus === 'Verified';
  const rating = worker.averageRating || worker.rating || 0;
  const jobs = worker.completedJobs || worker.jobs || 0;
  
  const score = calculateMatchingScore(worker);
  const badge = getMatchingBadge(worker, score);

  return (
    <div className="bg-card-white rounded-3xl shadow-md border border-border-gray overflow-hidden hover:shadow-lg transition-all group relative">
      {/* Badges */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
        {worker.isAvailable ? (
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md shadow-sm">Available Now</span>
        ) : (
          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md shadow-sm">Busy</span>
        )}
        {worker.emergencyAvailable && (
          <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1"><Zap size={12}/> Emergency Ready</span>
        )}
      </div>

      <div className="p-6">
        <div className="flex gap-4 items-start mb-4">
          <div className="relative">
            <img 
              src={worker.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=315D9C&color=fff`}
              alt={name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-bg-soft-blue"
            />
            {isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-accent-green text-white p-1 rounded-full border-2 border-white shadow-sm" title="Verified Worker">
                <ShieldCheck size={16} />
              </div>
            )}
            {!isVerified && worker.verificationStatus === 'Pending Verification' && (
              <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Pending Verification">
                <Clock size={16} />
              </div>
            )}
          </div>
          <div className="flex-1 pt-1">
            <h3 className="text-xl font-bold text-navy group-hover:text-primary transition-colors">{name}</h3>
            <p className="text-primary font-medium">{service}</p>
            <div className="flex items-center gap-1 mt-1 text-sm text-text-gray">
              <MapPin size={14} className="text-border-gray" />
              <span>{worker.distance ? `${worker.distance} km away` : (worker.area || worker.address || 'Nearby')}</span>
            </div>
          </div>
        </div>

        {badge && !isSimpleMode && (
          <div className="mb-3 inline-block bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
            ✨ {badge}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-5 p-3 bg-bg-soft-blue/30 rounded-xl">
          <div className="flex flex-col">
            <span className="text-xs text-text-gray font-medium mb-1">Rating</span>
            <div className="flex items-center gap-1 font-bold text-navy">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              <span>{rating > 0 ? rating.toFixed(1) : 'New'} <span className="text-xs font-normal text-text-gray">({jobs} jobs)</span></span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-text-gray font-medium mb-1">Expected Charge</span>
            <span className="font-bold text-navy">
              {price > 0 ? `Starts ₹${price}` : 'Ask Price'}
            </span>
          </div>
        </div>
        
        {worker.workingHoursStart && !isSimpleMode && (
           <p className="text-xs text-gray-500 flex items-center gap-1 mb-4"><Clock size={12}/> Working hours: {worker.workingHoursStart} - {worker.workingHoursEnd}</p>
        )}

        <div className="flex gap-2">
          {!isSimpleMode && (
              <>
                  <button className="flex-1 bg-green-50 text-green-600 font-bold py-2 rounded-xl hover:bg-green-100 transition-colors flex items-center justify-center gap-1">
                    <Phone size={18} /> Call
                  </button>
                  <button className="flex-1 bg-green-500 text-white font-bold py-2 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-1">
                    <MessageCircle size={18} /> Chat
                  </button>
              </>
          )}
          <Link 
            to={`/worker/${id}`} 
            className={`bg-primary text-white font-bold py-2 rounded-xl hover:bg-primary-hover transition-colors text-center shadow-md ${isSimpleMode ? 'w-full py-4 text-lg' : 'flex-1'}`}
          >
            {isSimpleMode ? 'View & Book / देखें' : 'View Profile'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;
