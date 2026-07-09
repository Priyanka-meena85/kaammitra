import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' or 'password'
  const [role, setRole] = useState('customer');
  const [step, setStep] = useState(1); // 1: phone, 2: otp
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) return toast.error('Enter valid 10-digit phone number');
    
    setIsLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { phone, role });
      toast.success(res.data.message || 'OTP sent successfully');
      if (res.data.demoOtp) {
        toast('Development Mode: Use OTP ' + res.data.demoOtp, { icon: '🛠️' });
      }
      setStep(2);
    } catch (err) {
      if (!err.isWakingUp) toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter 6 digit OTP');
    
    setIsLoading(true);
    try {
      // Pass action='login' (or omit, since backend defaults to login if not 'register')
      const res = await api.post('/auth/verify-otp', { phone, otp, role, action: 'login' });
      login(res.data.user, res.data.token);
      toast.success('Login successful!');
      navigate(res.data.user.role === 'worker' ? '/worker-dashboard' : (res.data.user.role === 'admin' ? '/admin' : '/customer-dashboard'));
    } catch (err) {
      if (!err.isWakingUp) toast.error(err.response?.data?.message || err.response?.data?.error || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { phone, password, role });
      login(res.data.user, res.data.token);
      toast.success('Login successful!');
      navigate(res.data.user.role === 'worker' ? '/worker-dashboard' : (res.data.user.role === 'admin' ? '/admin' : '/customer-dashboard'));
    } catch (err) {
      if (!err.isWakingUp) toast.error(err.response?.data?.error || err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-card-white rounded-3xl shadow-lg border border-border-gray p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-bg-soft-blue text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-2">Welcome Back</h1>
          <p className="text-text-gray text-sm">Login to your KaamMitra account</p>
        </div>

        {/* Role Selection */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button onClick={() => setRole('customer')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${role === 'customer' ? 'bg-white shadow-sm text-primary' : 'text-text-gray'}`}>Customer</button>
          <button onClick={() => setRole('worker')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${role === 'worker' ? 'bg-white shadow-sm text-primary' : 'text-text-gray'}`}>Worker</button>
          <button onClick={() => setRole('admin')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${role === 'admin' ? 'bg-white shadow-sm text-primary' : 'text-text-gray'}`}>Admin</button>
        </div>

        {/* Login Method Selection */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button onClick={() => { setLoginMethod('otp'); setStep(1); }} className={`pb-2 text-sm font-bold transition-colors border-b-2 ${loginMethod === 'otp' ? 'border-primary text-primary' : 'border-transparent text-text-gray'}`}>Phone OTP</button>
          <button onClick={() => { setLoginMethod('password'); }} className={`pb-2 text-sm font-bold transition-colors border-b-2 ${loginMethod === 'password' ? 'border-primary text-primary' : 'border-transparent text-text-gray'}`}>Password</button>
        </div>

        {loginMethod === 'otp' ? (
          step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                <input type="tel" required placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-primary" />
              </div>
              <button disabled={isLoading} type="submit" className="w-full bg-primary text-white font-bold text-lg py-3 rounded-xl shadow-md hover:bg-primary-hover transition-all disabled:opacity-50">
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-sm text-center mb-4 text-text-gray">OTP sent to {phone}. <button type="button" onClick={() => setStep(1)} className="text-primary font-bold">Edit</button></div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                <input type="text" required placeholder="Enter 6-digit OTP (123456)" value={otp} onChange={e => setOtp(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-primary text-center tracking-widest text-lg" maxLength={6} />
              </div>
              <button disabled={isLoading} type="submit" className="w-full bg-primary text-white font-bold text-lg py-3 rounded-xl shadow-md hover:bg-primary-hover transition-all disabled:opacity-50">
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handlePasswordLogin} className="space-y-5">
            <div className="relative">
              {role === 'admin' ? <User className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} /> : <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />}
              <input type={role === 'admin' ? 'text' : 'tel'} required placeholder={role === 'admin' ? "Username" : "Phone Number"} value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-primary" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-primary" />
            </div>
            <button disabled={isLoading} type="submit" className="w-full bg-primary text-white font-bold text-lg py-3 rounded-xl shadow-md hover:bg-primary-hover transition-all disabled:opacity-50">
              {isLoading ? 'Loading...' : 'Login'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-text-gray text-sm">
          Don't have an account?{' '}
          <button onClick={() => navigate(role === 'worker' ? '/worker-register' : '/register')} className="text-primary font-bold hover:underline">
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
