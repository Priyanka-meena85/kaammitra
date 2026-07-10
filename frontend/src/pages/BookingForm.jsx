import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, CheckCircle2, Mic, CreditCard, Banknote } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { startVoiceRecognition } from '../utils/voice';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { loadRazorpayScript } from '../utils/loadRazorpay';
import { createPaymentOrder, verifyPayment } from '../api/paymentApi';

const bookingSchema = z.object({
  description: z.string().min(10, 'Problem description must be at least 10 characters'),
  address: z.string().min(10, 'Please provide a complete address'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  contact: z.string().regex(/^[0-9]{10}$/, 'Contact must be exactly 10 digits'),
  urgency: z.enum(['Normal', 'Urgent'])
});

const BookingForm = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [worker, setWorker] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState(workerId || null);
  const [loading, setLoading] = useState(!!workerId);
  
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Step 1: Details, Step 2: Select Worker, Step 3: Payment Options
  const [step, setStep] = useState(workerId ? 2 : 1);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  React.useEffect(() => {
    if (!user) {
      toast.error('Please login to book a service');
      navigate('/login');
      return;
    }
    if (workerId) {
      const fetchWorker = async () => {
        try {
          const res = await api.get(`/workers/${workerId}`);
          setWorker(res?.data?.data || null);
        } catch (err) {
          toast.error('Worker not found');
          navigate('/workers');
        } finally {
          setLoading(false);
        }
      };
      fetchWorker();
    }
  }, [workerId, user, navigate]);

  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: { urgency: 'Normal' }
  });

  const handleVoiceInput = () => {
    setIsListening(true);
    startVoiceRecognition(
      (text) => {
        const currentProblem = getValues('description') || '';
        setValue('description', currentProblem ? currentProblem + ' ' + text : text, { shouldValidate: true });
        setIsListening(false);
      },
      (error) => {
        toast.error(error);
        setIsListening(false);
      }
    );
  };

  const onSubmit = async (data) => {
    if (!user) {
      toast.error('Session expired. Please login again.');
      navigate('/login');
      return;
    }

    if (!selectedWorkerId && step === 1) {
      // Fetch suggestions
      setLoadingSuggestions(true);
      try {
        const url = `/bookings/suggest-workers?service=${encodeURIComponent(data.description)}&area=${encodeURIComponent(data.address)}&preferredDate=${data.date}&preferredTime=${data.time}&urgency=${data.urgency === 'Urgent' ? 'emergency' : 'normal'}`;
        const res = await api.get(url);
        const fetchedSuggestions = res.data?.data || [];
        if (fetchedSuggestions.length > 0) {
          setSuggestions(fetchedSuggestions);
          toast.success('Found best matching workers for you!');
          setStep(2);
        } else {
          toast.error('No workers match your criteria. Try changing time or urgency.');
        }
      } catch (err) {
        toast.error('Failed to find workers. Please try again.');
      } finally {
        setLoadingSuggestions(false);
      }
      return;
    }
    
    // Create Booking
    try {
      const activeWorker = worker || suggestions.find(s => (s.worker._id || s.worker.id) === selectedWorkerId)?.worker;
      if (!activeWorker) return toast.error('Worker data missing');

      const serviceId = activeWorker.services && activeWorker.services.length > 0 && activeWorker.services[0]._id 
        ? activeWorker.services[0]._id 
        : activeWorker.services?.[0] || '60d0fe4f5311236168a109ca';

      const payload = {
        customerId: user._id,
        workerId: selectedWorkerId,
        serviceId: serviceId,
        description: data.description,
        address: data.address,
        date: data.date,
        time: data.time,
        urgency: data.urgency,
        contactNumber: data.contact,
        totalAmount: activeWorker.expectedCharge || activeWorker.startingPrice || 500
      };
      
      const res = await api.post('/bookings', payload);
      setCreatedBooking(res.data.data);
      toast.success('Booking created! Please select payment method.');
      setStep(3);
    } catch (err) {
      toast.error('Failed to submit booking. Please try again.');
    }
  };

  const handlePayment = async (paymentType) => {
    if (paymentType === 'cash') {
      navigate('/my-bookings');
      return;
    }

    setPaymentLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Failed to load payment gateway. Please check your connection.');
        setPaymentLoading(false);
        return;
      }

      const advanceAmount = Math.max(50, Math.round(createdBooking.totalAmount * 0.2));
      const amountToPay = paymentType === 'advance' ? advanceAmount : createdBooking.totalAmount;

      const orderData = await createPaymentOrder(createdBooking._id, paymentType, amountToPay);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: orderData.order.amount,
        currency: "INR",
        name: "KaamMitra",
        description: "Booking Payment",
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            await verifyPayment({
              bookingId: createdBooking._id,
              paymentRecordId: orderData.paymentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            toast.success('Payment successful!');
            navigate('/my-bookings');
          } catch (err) {
            toast.error('Payment verification failed.');
          }
        },
        prefill: {
          name: user.name,
          contact: user.phone
        },
        theme: {
          color: "#315D9C"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error(response.error.description || 'Payment failed');
      });
      rzp.open();

    } catch (error) {
      toast.error('Could not initiate payment');
      console.error(error);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-text-gray font-medium">Loading booking details...</div>;
  if (workerId && !worker && step < 3) return <div className="text-center py-20 text-red-500 font-bold">Worker not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-card-white rounded-3xl shadow-sm border border-border-gray p-8">
        
        {step < 3 ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-navy mb-2">Book Service</h1>
              {worker ? (
                <p className="text-text-gray">You are booking <span className="font-bold text-primary">{worker.name}</span> for <span className="font-bold text-primary">{worker.service || 'Service'}</span></p>
              ) : (
                <p className="text-text-gray">Fill out details to find the best matching worker.</p>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-text-gray">Describe the problem</label>
                  <button 
                    type="button" 
                    onClick={handleVoiceInput}
                    className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-bg-soft-blue text-primary hover:bg-blue-200'}`}
                  >
                    <Mic size={14} /> {isListening ? 'Listening...' : 'Speak Problem'}
                  </button>
                </div>
                <textarea
                  {...register('description')}
                  rows="3"
                  disabled={step === 2 && !worker}
                  placeholder="E.g., Fan is making noise, pipe is leaking..."
                  className={`w-full p-3 rounded-xl border ${errors.description ? 'border-red-500' : 'border-border-gray'} focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50`}
                ></textarea>
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Service Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                  <input
                    type="text"
                    {...register('address')}
                    disabled={step === 2 && !worker}
                    placeholder="Complete address (House no, Street, Landmark)"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.address ? 'border-red-500' : 'border-border-gray'} focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50`}
                  />
                </div>
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2">Preferred Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                    <input
                      type="date"
                      {...register('date')}
                      disabled={step === 2 && !worker}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.date ? 'border-red-500' : 'border-border-gray'} focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50`}
                    />
                  </div>
                  {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2">Preferred Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                    <input
                      type="time"
                      {...register('time')}
                      disabled={step === 2 && !worker}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.time ? 'border-red-500' : 'border-border-gray'} focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50`}
                    />
                  </div>
                  {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                  <input
                    type="tel"
                    {...register('contact')}
                    disabled={step === 2 && !worker}
                    placeholder="10-digit mobile number"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.contact ? 'border-red-500' : 'border-border-gray'} focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50`}
                  />
                </div>
                {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Urgency</label>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input 
                      type="radio" 
                      value="Normal" 
                      {...register('urgency')}
                      disabled={step === 2 && !worker}
                      className="peer hidden" 
                    />
                    <div className={`border border-border-gray rounded-xl p-4 text-center peer-checked:bg-bg-soft-blue peer-checked:border-blue-500 peer-checked:text-primary-hover font-medium transition-all ${(step === 2 && !worker) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      Normal
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input 
                      type="radio" 
                      value="Urgent" 
                      {...register('urgency')}
                      disabled={step === 2 && !worker}
                      className="peer hidden" 
                    />
                    <div className={`border border-border-gray rounded-xl p-4 text-center peer-checked:bg-accent-orange/10 peer-checked:border-red-500 peer-checked:text-accent-orange-hover font-medium transition-all ${(step === 2 && !worker) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      Urgent (Need ASAP)
                    </div>
                  </label>
                </div>
                {errors.urgency && <p className="text-red-500 text-sm mt-1">{errors.urgency.message}</p>}
              </div>

              {step === 1 && !workerId && (
                <button 
                  type="submit"
                  disabled={loadingSuggestions}
                  className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-primary-hover hover:shadow-xl transition-all disabled:opacity-75 flex justify-center items-center gap-2 mt-8"
                >
                  {loadingSuggestions ? 'Finding Workers...' : 'Find Best Workers'}
                </button>
              )}

              {step === 2 && !workerId && suggestions.length > 0 && (
                <div className="mt-8 border-t border-border-gray pt-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-navy">Suggested Workers</h2>
                    <button type="button" onClick={() => setStep(1)} className="text-sm text-primary hover:underline font-medium">Edit Details</button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {suggestions.map((item, index) => (
                      <div key={item.worker._id || item.worker.id || index} className={`border-2 rounded-xl transition-all ${selectedWorkerId === (item.worker._id || item.worker.id) ? 'border-primary shadow-md bg-blue-50/30' : 'border-transparent'}`}>
                        <div className="flex items-center gap-4 p-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-navy">{item.worker.name}</h3>
                              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.matchScore}% Match</span>
                            </div>
                            <p className="text-sm text-text-gray mb-2">{item.matchReason}</p>
                            <div className="text-sm font-medium text-navy">₹{item.worker.expectedCharge || item.worker.startingPrice || 300}</div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setSelectedWorkerId(item.worker._id || item.worker.id)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${selectedWorkerId === (item.worker._id || item.worker.id) ? 'bg-primary text-white' : 'bg-gray-100 text-text-gray hover:bg-gray-200'}`}
                          >
                            {selectedWorkerId === (item.worker._id || item.worker.id) ? 'Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(worker || (step === 2 && selectedWorkerId)) && (
                <button 
                  type="submit"
                  className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-primary-hover hover:shadow-xl transition-all flex justify-center items-center gap-2 mt-8"
                >
                  <CheckCircle2 size={24} /> Confirm Booking
                </button>
              )}
            </form>
          </>
        ) : (
          <div className="text-center">
            <CheckCircle2 size={64} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-navy mb-2">Booking Confirmed!</h2>
            <p className="text-text-gray mb-8">Choose how you want to pay.</p>

            <div className="grid gap-4">
              <button 
                onClick={() => handlePayment('advance')}
                disabled={paymentLoading}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-primary bg-blue-50 text-left hover:bg-blue-100 transition disabled:opacity-50"
              >
                <div>
                  <div className="font-bold text-navy flex items-center gap-2"><CreditCard size={18} /> Pay Advance (20%)</div>
                  <div className="text-sm text-text-gray">Secure your booking instantly.</div>
                </div>
                <div className="font-bold text-primary">₹{Math.max(50, Math.round(createdBooking.totalAmount * 0.2))}</div>
              </button>

              <button 
                onClick={() => handlePayment('full')}
                disabled={paymentLoading}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-green-500 bg-green-50 text-left hover:bg-green-100 transition disabled:opacity-50"
              >
                <div>
                  <div className="font-bold text-green-800 flex items-center gap-2"><CreditCard size={18} /> Pay Full Amount</div>
                  <div className="text-sm text-green-700">Pay now and relax.</div>
                </div>
                <div className="font-bold text-green-700">₹{createdBooking.totalAmount}</div>
              </button>

              <button 
                onClick={() => handlePayment('cash')}
                disabled={paymentLoading}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-left hover:bg-gray-100 transition disabled:opacity-50"
              >
                <div>
                  <div className="font-bold text-navy flex items-center gap-2"><Banknote size={18} /> Pay Cash Later</div>
                  <div className="text-sm text-text-gray">Pay directly to the worker after job completion.</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
