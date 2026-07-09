import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, PhoneCall, Briefcase, Map } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AreaLaunch = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    area: '',
    service: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.get('/areas')
      .then(res => setAreas(res.data.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(formData.phone.length < 10) return toast.error('Enter valid phone');
    setIsSubmitting(true);
    try {
      await api.post('/areas/launch', formData);
      toast.success('Request received! We will launch in your area soon.');
      setFormData({ name: '', phone: '', city: '', area: '', service: '' });
    } catch (err) {
      toast.error('Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-bg-soft-blue text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Map size={40} />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-navy mb-4">Our Service Areas</h1>
        <p className="text-text-gray text-lg">Currently active and verified workers are available in these cities.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
         <div className="bg-card-white p-6 rounded-3xl shadow-sm border border-border-gray">
            <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2"><MapPin/> Active Cities</h2>
            <div className="grid grid-cols-2 gap-4">
                {['Jaipur', 'Ajmer', 'Tonk', 'Kota'].map(city => (
                    <div key={city} className="bg-green-50 border border-green-200 text-green-800 font-bold px-4 py-3 rounded-xl flex justify-between items-center">
                        {city} <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    </div>
                ))}
            </div>
         </div>
         <div className="bg-card-white p-6 rounded-3xl shadow-sm border border-border-gray">
             <h2 className="text-xl font-bold text-navy mb-4">Not in your area?</h2>
             <p className="text-text-gray mb-6">Request KaamMitra to launch in your city or neighborhood. We will contact you when we arrive.</p>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={18} />
                    <input type="text" required placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-gray focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="relative">
                    <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={18} />
                    <input type="tel" required placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-gray focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={18} />
                        <input type="text" required placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-gray focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={18} />
                        <input type="text" required placeholder="Area" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-gray focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={18} />
                    <input type="text" required placeholder="Which service do you need?" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-gray focus:ring-2 focus:ring-blue-500" />
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-primary-hover transition-all disabled:opacity-50">
                    {isSubmitting ? 'Submitting...' : 'Request Launch'}
                </button>
             </form>
         </div>
      </div>
    </div>
  );
};

export default AreaLaunch;
