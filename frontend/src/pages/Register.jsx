import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Phone, Mail, Lock, MapPin, Target, ShieldCheck } from 'lucide-react';
import { getUserLocation } from '../utils/location';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [role, setRole] = useState(location.state?.role || 'customer');
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

  const handleRoleChange = (newRole) => {
    if (newRole === 'worker') {
      navigate('/worker-register');
    } else {
      setRole(newRole);
    }
  };

  const handleLocation = async () => {
    try {
      const coords = await getUserLocation();
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&addressdetails=1`);
      const data = await res.json();
      
      const addressObj = data.address || {};
      const fetchedCity = addressObj.city || addressObj.town || addressObj.village || addressObj.county || '';
      const fetchedArea = addressObj.suburb || addressObj.neighbourhood || addressObj.residential || '';
      const fullAddress = data.display_name || 'Fetched from GPS Location';

      setFormData(prev => ({ 
        ...prev, 
        city: fetchedCity || prev.city,
        area: fetchedArea || prev.area,
        address: fullAddress 
      }));
      toast.success('Location fetched successfully');
    } catch(e) {
      console.error(e);
      toast.error('Location access denied or failed to fetch address');
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
      navigate('/customer/dashboard');
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
          <div className="w-16 h-16 bg-bg-soft-blue text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary mb-2">Your local service account</p>
          <h1 className="text-3xl font-extrabold text-navy mb-2">Create an account</h1>
          <p className="text-text-gray text-sm">Sign up to manage bookings and connect with your local network.</p>
        </div>

        {/* Role Selection */}
        <div className="mb-6 relative">
          <label className="block text-sm font-bold text-navy mb-2">Select Account Type</label>
          <select 
            value={role} 
            onChange={(e) => handleRoleChange(e.target.value)} 
            className="w-full bg-gray-50 border border-border-gray text-navy text-sm font-bold rounded-xl focus:ring-2 focus:ring-primary focus:border-primary block p-3 appearance-none"
          >
            <option value="customer">Customer</option>
            <option value="worker">Worker</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 top-7 flex items-center px-4 text-text-gray">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
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


        <div className="mt-6 text-center text-text-gray text-sm">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
