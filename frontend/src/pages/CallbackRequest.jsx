import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneCall, User, MapPin, Briefcase, Clock, FileText } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CallbackRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    city: '',
    area: '',
    preferredCallTime: '',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(formData.phone.length < 10) return toast.error('Enter valid phone');
    setIsSubmitting(true);
    try {
      await api.post('/callback-requests', formData);
      toast.success('Callback request received! Our team will call you shortly.');
      navigate('/');
    } catch (err) {
      toast.error('Failed to submit callback request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-card-white rounded-3xl shadow-lg border border-border-gray p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-bg-soft-blue text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneCall size={32} />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-2">Request a Callback</h1>
          <p className="text-text-gray text-sm">Don't want to type? Leave your details and we will call you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
            <input type="text" required placeholder="Your Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="relative">
            <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
            <input type="tel" required placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
            <input type="text" required placeholder="Service Needed (e.g. Plumber)" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                <input type="text" placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500" />
             </div>
             <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                <input type="text" placeholder="Area" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500" />
             </div>
          </div>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
            <input type="text" placeholder="Preferred call time (e.g. Morning 10AM)" value={formData.preferredCallTime} onChange={e => setFormData({...formData, preferredCallTime: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500" />
          </div>
          <textarea placeholder="Any specific note? (Optional)" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full p-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500" rows="3"></textarea>

          <button disabled={isSubmitting} type="submit" className="w-full bg-primary text-white font-bold text-lg py-3 rounded-xl shadow-lg hover:bg-primary-hover transition-all disabled:opacity-50 mt-4">
            {isSubmitting ? 'Sending...' : 'Request Callback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CallbackRequest;
