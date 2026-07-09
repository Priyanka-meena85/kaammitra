import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Mail, Lock, MapPin, Target, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';
import { getUserLocation } from '../utils/location';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  
  // Form State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    area: '',
    password: ''
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

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      return toast.error('Please enter a valid 10-digit phone number');
    }
    try {
      const res = await api.post('/auth/send-otp', { phone });
      setOtpSent(true);
      toast.success('OTP Sent Successfully');
      if (res.data.demoOtp) {
        toast('Development Mode: Use OTP ' + res.data.demoOtp, { icon: '🛠️' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      return toast.error('Please enter a valid 6-digit OTP');
    }
    try {
      await api.post('/auth/verify-otp', { phone, otp, role: 'customer', action: 'register' });
      setPhoneVerified(true);
      toast.success('Phone verified successfully');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Invalid OTP');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!phoneVerified) return toast.error('Please verify your phone number first');
    if (!formData.city) return toast.error('Please select your city');

    try {
      const payload = {
        role: 'customer',
        phone,
        phoneVerified: true,
        ...formData
      };
      const res = await api.post('/auth/register', payload);
      login(res.data.user, res.data.token);
      toast.success('Account created successfully');
      navigate('/customer-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 md:py-16">
      <div className="bg-card-white rounded-3xl shadow-lg border border-border-gray p-6 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Create Account</h1>
          <p className="text-text-gray">Join KaamMitra as a Customer</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 space-x-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <div className={`h-1 w-12 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
        </div>

        {step === 1 ? (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-navy text-center mb-4">Verify your phone number</h2>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input 
                type="tel" 
                maxLength="10"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                disabled={otpSent}
                placeholder="10-digit Phone Number" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100" 
              />
            </div>

            {!otpSent ? (
              <button onClick={handleSendOtp} className="w-full bg-bg-soft-blue text-primary font-bold text-lg py-3 rounded-xl hover:bg-blue-100 transition-all">
                Send OTP
              </button>
            ) : (
              <>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                  <input 
                    type="text" 
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP" 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none text-center tracking-widest text-lg font-bold" 
                  />
                </div>
                <button onClick={handleVerifyOtp} className="w-full bg-primary text-white font-bold text-lg py-3 rounded-xl shadow-md hover:bg-primary-hover transition-all">
                  Verify & Continue
                </button>
                <div className="text-center mt-2">
                  <button onClick={handleSendOtp} className="text-text-gray text-sm font-medium hover:text-primary">
                    Resend OTP
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input type="tel" value={phone} readOnly className="w-full pl-10 pr-4 py-3 rounded-xl border border-green-200 bg-green-50 text-navy font-bold focus:outline-none" />
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={20} />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full Name" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email (Optional)" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <select required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none bg-white">
                <option value="">Select City</option>
                <option value="Tonk">Tonk</option>
                <option value="Ajmer">Ajmer</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Other">Other</option>
              </select>
              <input type="text" required value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} placeholder="Area / Locality" className="w-full px-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                <input 
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

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input type="password" required minLength="6" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Create Password (Min 6 chars)" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <button type="submit" disabled={!phoneVerified} className="w-full bg-orange-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
              Complete Registration
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-text-gray">
          Want to offer services? <Link to="/worker-register" className="text-primary font-bold hover:underline">Become a Worker</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
