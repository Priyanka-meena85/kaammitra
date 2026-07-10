import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Phone, MapPin, Zap, MessageCircle } from 'lucide-react';
import { getUserLocation } from '../utils/location';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Emergency = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    service: 'Electrician',
    phone: '',
    note: ''
  });
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocation = async () => {
    try {
      const loc = await getUserLocation();
      setLocation(loc);
      setAddress('Current Location Fetched');
      toast.success('Location saved for faster help!');
    } catch(e) {
      toast.error('Location access denied');
    }
  };

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone || formData.phone.length < 10) {
      return toast.error('Please enter a valid phone number');
    }

    setIsSubmitting(true);
    try {
      await api.post('/emergency-leads', {
        ...formData,
        latitude: location?.lat,
        longitude: location?.lng,
        area: address
      });
      toast.success('Emergency Request Sent! Help is on the way.');
      navigate('/');
    } catch (err) {
      toast.error('Failed to submit. Please call support directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const findNearest = (type) => {
    if (!formData.service) return toast.error('Select a service first');
    
    const WHATSAPP_SUPPORT_NUMBER = import.meta.env.VITE_WHATSAPP_SUPPORT_NUMBER || "918503996575";
    const supportNumber = WHATSAPP_SUPPORT_NUMBER;

    if (type === 'call') {
      window.open(`tel:+${supportNumber}`, '_self');
    } else if (type === 'wa') {
      const WHATSAPP_SUPPORT_MESSAGE = "Hello KaamMitra, mujhe ek service ke regarding help chahiye.";
      const whatsappUrl = `https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=${encodeURIComponent(WHATSAPP_SUPPORT_MESSAGE)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-orange-500 rounded-3xl shadow-xl text-white p-8 text-center mb-8">
        <AlertTriangle size={56} className="mx-auto mb-4 text-orange-200 animate-pulse" />
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Emergency Help</h1>
        <p className="text-orange-100 max-w-xl mx-auto text-lg">
          Fast response for urgent home problems.
        </p>
      </div>

      <div className="bg-card-white rounded-3xl shadow-sm border border-border-gray p-6 md:p-8">
        <form onSubmit={handleEmergencySubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-navy mb-2">What is the problem?</label>
            <div className="grid grid-cols-2 gap-4">
               <label className={`border-2 rounded-xl p-4 flex flex-col items-center cursor-pointer transition ${formData.service === 'Electrician' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                  <input type="radio" name="service" value="Electrician" className="hidden" onChange={(e) => setFormData({...formData, service: e.target.value})} checked={formData.service === 'Electrician'} />
                  <Zap size={32} className={formData.service === 'Electrician' ? 'text-orange-600' : 'text-gray-400'} />
                  <span className="mt-2 font-bold text-navy">Electrician</span>
               </label>
               <label className={`border-2 rounded-xl p-4 flex flex-col items-center cursor-pointer transition ${formData.service === 'Plumber' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                  <input type="radio" name="service" value="Plumber" className="hidden" onChange={(e) => setFormData({...formData, service: e.target.value})} checked={formData.service === 'Plumber'} />
                  <Zap size={32} className={formData.service === 'Plumber' ? 'text-orange-600' : 'text-gray-400'} />
                  <span className="mt-2 font-bold text-navy">Plumber</span>
               </label>
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-navy mb-2">Your Phone Number</label>
             <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter mobile number" 
                  className="w-full pl-10 pr-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 text-lg font-bold"
                />
             </div>
          </div>

          <div>
             <button type="button" onClick={handleLocation} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-orange-200 text-orange-700 font-bold bg-orange-50 hover:bg-orange-100 transition">
                <MapPin size={20} /> {address ? 'Location Saved' : 'Share Current Location (Faster Match)'}
             </button>
          </div>

          <div>
             <label className="block text-sm font-bold text-navy mb-2">Any Note? (Optional)</label>
             <input 
               type="text" 
               value={formData.note}
               onChange={(e) => setFormData({...formData, note: e.target.value})}
               placeholder="e.g. Water leaking everywhere" 
               className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500"
             />
          </div>

          <div className="pt-4 space-y-4">
             <button disabled={isSubmitting} type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg transition-all disabled:opacity-50">
               {isSubmitting ? 'Sending...' : 'Request Emergency Help'}
             </button>
             
             <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => findNearest('call')} className="flex items-center justify-center gap-2 bg-green-100 text-green-800 hover:bg-green-200 py-3 rounded-xl font-bold transition">
                   <Phone size={18} /> Call Nearest
                </button>
                <button type="button" onClick={() => findNearest('wa')} className="flex items-center justify-center gap-2 bg-green-500 text-white hover:bg-green-600 py-3 rounded-xl font-bold transition">
                   <MessageCircle size={18} /> WhatsApp
                </button>
             </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Emergency;
