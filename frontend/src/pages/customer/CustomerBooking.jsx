import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { getWorkerDetails, createBooking } from '../../api/customerApi';
import toast from 'react-hot-toast';

const CustomerBooking = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [worker, setWorker] = useState(null);
  const [loadingWorker, setLoadingWorker] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('Home (123 Main St)');

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        setLoadingWorker(true);
        const res = await getWorkerDetails(workerId);
        if (res.success && res.data) {
          setWorker(res.data);
          setService(res.data.services?.[0] || 'General Service');
          
          // Set date to today as default (format YYYY-MM-DD for backend)
          const today = new Date();
          setDate(today.toISOString().split('T')[0]);
          setTime('14:00'); // Default 2 PM
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
        setLoadingWorker(false);
      }
    };
    
    if (workerId) fetchWorker();
  }, [workerId, navigate]);

  const handleConfirm = async () => {
    if (submitting) return; // double-tap protection

    try {
      setSubmitting(true);
      
      const payload = {
        workerId: worker._id,
        service: service,
        date: date,
        time: time,
        address: location,
        paymentMode: 'cash',
        urgency: 'normal'
      };

      const res = await createBooking(payload);
      
      if (res.success && res.data) {
        toast.success("Booking confirmed!");
        // Route to success page with booking ID
        navigate(`/customer/booking/confirm`, { state: { bookingId: res.data._id } });
      } else {
        toast.error("Failed to create booking.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      if (!error.isWakingUp) {
        toast.error(error.response?.data?.message || "Failed to create booking. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleConfirm();
    }
  };

  if (loadingWorker) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
        <p className="text-slate-500 font-medium">Preparing booking...</p>
      </div>
    );
  }

  if (!worker) return null;

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col items-center md:py-10">
      <div className="w-full max-w-2xl flex flex-col min-h-screen md:min-h-[600px] md:h-auto md:bg-white md:rounded-3xl md:shadow-xl relative md:border md:border-slate-100">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-slate-100 shadow-sm z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-800">Book Service</h1>
        </div>
        {/* Progress Bar */}
        <div className="flex items-center gap-2 px-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-1 flex items-center">
              <div className={`h-1.5 w-full rounded-full ${step >= i ? 'bg-orange-500' : 'bg-slate-200'}`}></div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 font-medium mt-2 px-2 uppercase tracking-wide">
          Step {step} of 4: {step === 1 ? 'Service' : step === 2 ? 'Time' : step === 3 ? 'Location' : 'Confirm'}
        </p>
      </div>

      <div className="flex-grow p-4 md:p-8 overflow-y-auto pb-24 md:pb-32">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Confirm Service</h2>
            <div className="space-y-3">
              {[service, 'General Checkup', 'Other'].map(s => (
                <div 
                  key={s}
                  onClick={() => setService(s)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                    service === s ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <span className={`font-medium ${service === s ? 'text-blue-800' : 'text-slate-700'}`}>{s}</span>
                  {service === s && <CheckCircle2 size={20} className="text-orange-500" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">When do you need help?</h2>
            
            <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-800 mb-4 focus:ring-2 focus:ring-orange-500 outline-none"
              min={new Date().toISOString().split('T')[0]}
            />
            
            <label className="block text-sm font-bold text-slate-700 mb-2">Time</label>
            <input 
              type="time" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Where should the worker come?</h2>
            <div className="space-y-3">
              {['Home (123 Main St)', 'Work (456 Tech Park)', 'Use current location'].map(l => (
                <div 
                  key={l}
                  onClick={() => setLocation(l)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                    location === l ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <MapPin size={20} className={location === l ? 'text-orange-500' : 'text-slate-400'} />
                  <span className={`font-medium ${location === l ? 'text-blue-800' : 'text-slate-700'}`}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Confirm Details</h2>
            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Worker</p>
                <p className="text-slate-800 font-medium mt-1">{worker.name}</p>
              </div>
              <div className="h-px bg-slate-100"></div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Service</p>
                <p className="text-slate-800 font-medium mt-1">{service}</p>
              </div>
              <div className="h-px bg-slate-100"></div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Date & Time</p>
                <p className="text-slate-800 font-medium mt-1">{date} at {time}</p>
              </div>
              <div className="h-px bg-slate-100"></div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Location</p>
                <p className="text-slate-800 font-medium mt-1">{location}</p>
              </div>
            </div>

            <div className="mt-6 bg-orange-50 rounded-2xl p-4 flex justify-between items-center border border-orange-100">
              <span className="text-orange-800 font-bold">Estimated Price</span>
              <span className="text-xl font-black text-orange-600">₹{worker.expectedCharge || 299}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action */}
      <div className="fixed md:absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 md:p-6 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] md:shadow-none z-50 flex gap-3 pb-safe md:pb-6 rounded-b-3xl">
        <button 
          onClick={nextStep}
          disabled={submitting}
          className={`w-full font-bold text-lg py-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 ${
            submitting ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-orange-500 hover:bg-blue-700 text-white'
          }`}
        >
          {submitting ? (
            <><Loader2 size={20} className="animate-spin" /> Processing...</>
          ) : step === 4 ? (
            'Confirm Booking'
          ) : (
            <>Continue <ChevronRight size={20} /></>
          )}
        </button>
      </div>
      </div>
    </div>
  );
};

export default CustomerBooking;
