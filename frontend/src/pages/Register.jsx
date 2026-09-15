import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Mail, Lock, MapPin, Target } from 'lucide-react';
import { getUserLocation } from '../utils/location';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    area: ''
  });

  const handleLocation = async () => {
    try {
      await getUserLocation();
      setFormData(prev => ({ ...prev, address: 'Fetched from GPS Location' }));
      toast.success('Location fetched successfully');
    } catch(e) {
      toast.error('Location access denied');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.city) return toast.error('Please select your city');

    setIsLoading(true);
    try {
      const payload = {
        role: 'customer',
        ...formData
      };
      // Normalize phone if provided
      if (payload.phone) {
          payload.phone = payload.phone.replace(/\D/g, '').slice(-10);
      }
      
      const res = await api.post('/auth/register', payload);
      login(res.data.user, res.data.token);
      toast.success('Account created successfully');
      navigate('/customer-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="market-hero min-h-[calc(100vh-4rem)] py-8 md:py-14 px-4">
      <div className="max-w-md mx-auto bg-card-white rounded-2xl shadow-xl border border-border-gray p-6 md:p-8">
        <div className="text-center mb-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary mb-2">For customers</p>
          <h1 className="text-3xl font-extrabold text-navy mb-2">Create your account</h1>
          <p className="text-text-gray">Find trusted local help when you need it.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
            <input aria-label="Full Name" type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full Name" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
            <input aria-label="Email Address" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email Address" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
            <input aria-label="Create Password (Min 6 chars)" type="password" required minLength="6" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Create Password (Min 6 chars)" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <div className="relative pt-4 border-t border-border-gray">
            <h3 className="text-sm font-bold text-navy mb-3">Additional Details</h3>
            <div className="relative mb-4">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input aria-label="Phone Number" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} placeholder="Phone Number (Optional)" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <select aria-label="City" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none bg-white">
              <option value="">Select City</option>
              <option value="Tonk">Tonk</option>
              <option value="Ajmer">Ajmer</option>
              <option value="Jaipur">Jaipur</option>
              <option value="Other">Other</option>
            </select>
            <input aria-label="Area / Locality" type="text" required value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} placeholder="Area / Locality" className="w-full px-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input aria-label="Complete Home Address" 
                type="text" 
                required 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Complete Home Address" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
            <button type="button" onClick={handleLocation} className="mt-2 text-sm text-primary font-bold flex items-center gap-1 hover:underline">
              <Target size={16}/> Use my current location
            </button>
          </div>

          <button disabled={isLoading} type="submit" className="w-full bg-orange-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Submitting...' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-6 text-center text-text-gray">
          Want to offer services? <Link to="/worker-register" className="text-primary font-bold hover:underline">Become a Worker</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
