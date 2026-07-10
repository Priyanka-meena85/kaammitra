import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, MessageCircle, ShieldCheck, CheckCircle, AlertTriangle, IndianRupee, Clock, ThumbsUp } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { workers as dummyWorkers } from '../data/workers';
import RatingModal from '../components/RatingModal';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { useSimpleMode } from '../context/SimpleModeContext';
import { speakText } from '../utils/speech';
import { Volume2 } from 'lucide-react';
import { extractObject, extractArray } from '../utils/apiResponse';
import { getWorkerReviews, reportReview } from '../api/reviewApi';
import SafetyReportModal from '../components/SafetyReportModal';

const WorkerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSimpleMode } = useSimpleMode();
  
  const [worker, setWorker] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const res = await api.get(`/workers/${id}`);
        setWorker(extractObject(res, ["worker"]));
        
        // Fetch reviews
        try {
            const reviewRes = await getWorkerReviews(id);
            setReviews(reviewRes.data?.data?.reviews || []);
        } catch(e) {
            console.log('No reviews found');
        }

      } catch (err) {
        console.error('Failed to fetch worker', err);
        if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_DATA === 'true') {
          const dummy = dummyWorkers.find(w => w.id === parseInt(id) || w.id === id || w._id === id);
          if (dummy) {
            setWorker(dummy);
            toast('Demo profile loaded (Development Mode)', { icon: 'ℹ️' });
          } else {
            toast.error('Worker not found');
            navigate('/workers');
          }
        } else {
          if (err.isWakingUp) {
            setApiError('Server is waking up. Please wait 30 seconds and try again.');
          } else {
            toast.error('Worker not found');
            navigate('/workers');
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWorker();
  }, [id, navigate]);

  if (loading) return <div className="text-center py-20 text-text-gray font-medium">Loading profile...</div>;
  if (apiError) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-orange-50 rounded-3xl shadow-sm border border-orange-200 p-12 text-center">
        <AlertTriangle size={64} className="mx-auto text-orange-400 mb-4" />
        <h2 className="text-2xl font-bold text-orange-900 mb-2">{apiError}</h2>
        <p className="text-orange-700 mb-6">Render's free tier sleeps after 15 minutes of inactivity. It takes a moment to spin back up.</p>
        <button onClick={() => window.location.reload()} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md">
          Try Again
        </button>
      </div>
    </div>
  );
  if (!worker) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Helmet>
          <title>Worker Not Found | KaamMitra</title>
        </Helmet>
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <AlertTriangle size={48} />
        </div>
      </div>
    );
  }

  // Normalize fields
  const name = worker?.name || 'Worker Name';
  const service = worker?.service || (worker?.services && worker.services[0]) || 'Service';
  const isVerified = worker?.isVerified || worker?.verificationStatus === 'Verified';
  const isAvailable = worker?.isAvailable !== undefined ? worker.isAvailable : true;
  const price = worker?.expectedCharge || worker?.startingPrice || 0;
  const rating = worker?.averageRating || worker?.rating || 0;
  const jobs = worker?.completedJobs || worker?.jobs || 0;
  const trustScore = worker?.trustScore || 50;
  const badges = worker?.badges || [];
  const riskLevel = worker?.riskLevel || 'low';
  
  const handleCallWorker = async () => {
    try {
      await api.post('/leads', { workerId: worker._id || id, customerId: user?._id || null, workerName: name, workerPhone: worker.phone, service: service, source: 'call', pageSource: 'worker-profile' });
    } catch(e) {}
    window.location.href = `tel:${worker.phone}`;
  };

  const handleWhatsAppWorker = async () => {
    try {
      await api.post('/leads', { workerId: worker._id || id, customerId: user?._id || null, workerName: name, workerPhone: worker.phone, service: service, source: 'whatsapp', pageSource: 'worker-profile' });
    } catch(e) {}
    const msg = encodeURIComponent(`Hi, I saw your profile on KaamMitra. I need help with ${service}.`);
    window.open(`https://wa.me/91${worker.phone}?text=${msg}`, '_blank');
  };

  const handleListen = () => {
    speakText(`${name} verified worker profile. Service ${service}. Experience ${worker.experience || 0} years. Rating ${rating}. Charge ${price}. Call ya WhatsApp button se connect kar sakte hain.`);
  };

  const handleBooking = () => {
    if (!user) {
        toast.error('Please login to book a worker');
        navigate('/login');
        return;
    }
    navigate(`/booking/${id}`);
  };

  const handleRatingSubmit = async (ratingData) => {
    if (!user) {
        toast.error('Please login to rate');
        return;
    }
    try {
        await api.post('/ratings', {
            workerId: id,
            customerId: user._id,
            rating: ratingData.rating,
            review: ratingData.review
        });
        toast.success('Thank you for rating!');
        setIsRatingModalOpen(false);
        // Refresh ratings locally
        setRatings([...ratings, { ...ratingData, customerId: user, createdAt: new Date() }]);
    } catch (err) {
        toast.error('Failed to submit rating');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-bg-warm">
      <Helmet>
        <title>{`${worker.name} - ${service} | KaamMitra`}</title>
        <meta name="description" content={`Hire ${name}, a verified professional in ${worker.address || worker.area || 'your area'}. Average rating: ${rating || 0}.`} />
      </Helmet>

      <div className="bg-card-white rounded-3xl shadow-sm border border-border-gray overflow-hidden mb-8">
        {/* Header */}
        <div className="bg-bg-soft-blue p-8 relative">
           <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
             {isVerified && (
                <div className="bg-white/90 text-accent-green px-4 py-2 rounded-full font-bold shadow-sm flex items-center gap-2">
                  <ShieldCheck size={18} /> Verified Background
                </div>
             )}
             <div className="bg-white/90 text-blue-600 px-4 py-2 rounded-full font-bold shadow-sm flex items-center gap-2">
               Trust Score: {trustScore}/100
             </div>
           </div>
           <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
              <img 
                src={worker.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=315D9C&color=fff&size=150`}
                alt={name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
              />
              <div className="flex-1 mt-2">
                 <div className="flex items-center gap-2 justify-center md:justify-start"><h1 className="text-3xl font-bold text-navy">{name}</h1><button onClick={handleListen} className="text-primary hover:bg-blue-100 p-2 rounded-full"><Volume2 size={20}/></button></div>
                 <p className="text-xl text-primary font-medium">{service}</p>
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-text-gray">
                    <span className="flex items-center gap-1"><MapPin size={18} className="text-border-gray" /> {worker.address || worker.area || worker.city || 'Nearby'}</span>
                    <span className="flex items-center gap-1 font-bold text-navy"><Star size={18} className="text-yellow-400 fill-yellow-400" /> {rating > 0 ? rating.toFixed(1) : 'New'} ({jobs} jobs)</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
                {/* Left col - Details */}
                <div className="md:col-span-2 space-y-8">
                    
                    <div>
                        <h2 className="text-xl font-bold text-navy mb-4">About Me</h2>
                        <p className="text-text-gray leading-relaxed">
                            {worker?.bio || `Hi, I am ${name}. I have ${worker?.experience || 'several'} years of experience working as a ${service}. I provide high quality service with full satisfaction guarantee.`}
                        </p>
                    </div>

                    {!isSimpleMode && (Array.isArray(worker?.skills) ? worker.skills : []).length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-navy mb-4">Skills & Expertise</h2>
                            <div className="flex flex-wrap gap-2">
                                {(Array.isArray(worker?.skills) ? worker.skills : []).map(skill => (
                                    <span key={skill} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trust Indicators */}
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                        <h2 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2"><ShieldCheck/> Trust & Verification</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-green-600" />
                                <span className="text-green-800 font-medium">ID Verified (Aadhar)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-green-600" />
                                <span className="text-green-800 font-medium">Phone Number Verified</span>
                            </div>
                            {worker.areaVerified && (
                                <div className="flex items-center gap-3">
                                    <CheckCircle size={20} className="text-green-600" />
                                    <span className="text-green-800 font-medium">Local Address Verified</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-green-600" />
                                <span className="text-green-800 font-medium">No Open Complaints</span>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Badges */}
                    {badges.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-navy mb-4">Worker Badges</h2>
                            <div className="flex flex-wrap gap-3">
                                {badges.map((badge, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-full text-sm font-bold shadow-sm">
                                        <Star size={14} className="fill-yellow-500 text-yellow-500"/> {badge.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-navy">Customer Reviews</h2>
                        </div>
                        {reviews.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                <MessageCircle size={32} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-gray-500">No verified reviews yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((r, i) => (
                                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-navy">{r.reviewerId?.name || 'Customer'}</span>
                                            <span className="flex items-center gap-1 text-sm font-bold text-yellow-600"><Star size={14} className="fill-yellow-500" /> {r.rating}</span>
                                        </div>
                                        {r.isVerifiedBooking && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold mb-2 inline-block">✓ Verified Booking</span>}
                                        {r.title && <p className="font-bold text-gray-800 text-sm mb-1">{r.title}</p>}
                                        {r.comment && <p className="text-gray-600 text-sm mb-3">{r.comment}</p>}
                                        {r.tags && r.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {r.tags.map(t => (
                                                    <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{t.replace('_', ' ')}</span>
                                                ))}
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => {
                                                reportReview(r._id).then(() => toast.success('Review reported'));
                                            }}
                                            className="text-xs text-red-500 hover:underline absolute bottom-4 right-4"
                                        >
                                            Report
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right col - Actions */}
                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="mb-6 pb-6 border-b border-gray-200">
                            <span className="text-sm text-text-gray font-medium">Expected Charge (Visiting/Min)</span>
                            <div className="flex items-end gap-1 mt-1">
                                <span className="text-3xl font-extrabold text-navy">₹{price > 0 ? price : '300'}</span>
                                <span className="text-text-gray mb-1 text-sm">approx</span>
                            </div>
                        </div>

                        {!isSimpleMode && (
                           <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Clock size={20}/></div>
                                    <div>
                                        <p className="font-bold text-navy text-sm">Working Hours</p>
                                        <p className="text-xs text-text-gray">{worker.workingHoursStart || '09:00 AM'} - {worker.workingHoursEnd || '07:00 PM'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><AlertTriangle size={20}/></div>
                                    <div>
                                        <p className="font-bold text-navy text-sm">Emergency</p>
                                        <p className="text-xs text-text-gray">{worker.emergencyAvailable ? 'Available 24x7 for urgent cases' : 'Not available'}</p>
                                    </div>
                                </div>
                           </div>
                        )}

                        <div className="space-y-3">
                            <button onClick={handleBooking} className={`w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg transition-all text-lg ${!worker.isAvailable && 'opacity-50 cursor-not-allowed'}`} disabled={!worker.isAvailable}>
                                {worker.isAvailable ? 'Book Now' : 'Currently Busy'}
                            </button>
                            
                            {!isSimpleMode && (
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handleCallWorker} className="bg-white border border-green-500 text-green-600 hover:bg-green-50 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                                        <Phone size={18} /> Call
                                    </button>
                                    <button onClick={handleWhatsAppWorker} className="bg-green-500 text-white hover:bg-green-600 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                                        <MessageCircle size={18} /> WhatsApp
                                    </button>
                                </div>
                            )}
                            
                            <div className="pt-4 border-t border-gray-200 text-center">
                                <p className="text-xs text-gray-500 mb-2">Notice any suspicious activity?</p>
                                <button onClick={() => setIsSafetyModalOpen(true)} className="text-red-500 text-sm font-bold hover:underline">Report Profile</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <RatingModal 
        isOpen={isRatingModalOpen} 
        onClose={() => setIsRatingModalOpen(false)} 
        onSubmit={handleRatingSubmit} 
        workerName={name} 
      />

      <SafetyReportModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        targetId={worker._id || id}
        targetRole="worker"
      />
    </div>
  );
};

export default WorkerProfile;
