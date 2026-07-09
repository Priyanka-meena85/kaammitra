import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Target, Briefcase, Wrench, IndianRupee, Image, FileText } from 'lucide-react';
import { services } from '../data/services';
import { getUserLocation } from '../utils/location';

const WorkerRegister = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');

  const handleLocation = async () => {
    try {
      await getUserLocation();
      setAddress('Fetched from GPS Location');
    } catch(e) {
      alert('Location access denied');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const user = { role: 'worker', name: 'New Worker' };
    localStorage.setItem('kaammitra_user', JSON.stringify(user));
    alert('Worker Registration successful! Please wait for verification.');
    navigate('/worker-dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-card-white rounded-3xl shadow-lg border border-border-gray p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Become a KaamMitra</h1>
          <p className="text-text-gray">Register as a worker and start getting jobs near you.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input type="text" required placeholder="Full Name" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input type="tel" required placeholder="Phone Number" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2">Service Category</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                <select required className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none bg-card-white">
                  <option value="">Select Service...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.hindiName})</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2">Experience (Years)</label>
              <div className="relative">
                <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                <input type="number" required placeholder="e.g. 5" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-gray mb-2">Expected Charge (₹ per visit/hour)</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input type="number" required placeholder="e.g. 300" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-gray mb-2">Work Address / Base Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input 
                type="text" 
                required 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
            <button type="button" onClick={handleLocation} className="mt-2 text-sm text-primary font-bold flex items-center gap-1 hover:underline">
              <Target size={16}/> Use my current location
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border-gray">
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 flex items-center gap-2">
                <Image size={18} className="text-text-gray" /> Profile Photo
              </label>
              <input type="file" accept="image/*" className="w-full text-sm text-text-gray file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-bg-soft-blue file:text-primary-hover hover:file:bg-bg-soft-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 flex items-center gap-2">
                <FileText size={18} className="text-text-gray" /> ID Proof (Aadhar/Voter ID)
              </label>
              <input type="file" accept="image/*,.pdf" required className="w-full text-sm text-text-gray file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-bg-soft-blue file:text-primary-hover hover:file:bg-bg-soft-blue" />
            </div>
          </div>

          <button type="submit" className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-primary-hover transition-all mt-8">
            Register as Worker
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkerRegister;
