import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Mail, Lock, MapPin, Target } from 'lucide-react';
import { getUserLocation } from '../utils/location';

const Register = () => {
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
    const user = { role: 'customer', name: 'New User' };
    localStorage.setItem('kaammitra_user', JSON.stringify(user));
    alert('Registration successful!');
    navigate('/customer-dashboard');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-card-white rounded-3xl shadow-lg border border-border-gray p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Create Account</h1>
          <p className="text-text-gray">Join KaamMitra as a Customer</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
            <input type="text" required placeholder="Full Name" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
            <input type="tel" required placeholder="Phone Number" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
            <input type="email" placeholder="Email (Optional)" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          
          <div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input 
                type="text" 
                required 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Home Address" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
            <button type="button" onClick={handleLocation} className="mt-2 text-sm text-primary font-bold flex items-center gap-1 hover:underline">
              <Target size={16}/> Use my current location
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
            <input type="password" required placeholder="Create Password" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <button type="submit" className="w-full bg-orange-500 text-white font-bold text-lg py-3 rounded-xl shadow-lg hover:bg-orange-600 transition-all mt-4">
            Register
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
