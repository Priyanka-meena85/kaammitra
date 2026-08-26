import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Phone, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import toast from 'react-hot-toast';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState('customer');
  const [step, setStep] = useState(1); // 1: phone, 2: otp, 3: new password
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [idToken, setIdToken] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const setupRecaptcha = async () => {
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch { /* stale verifier */ }
      window.recaptchaVerifier = null;
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    await window.recaptchaVerifier.render();
    return window.recaptchaVerifier;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const normalized = phone.replace(/\D/g, '').slice(-10);
    if (normalized.length !== 10) return toast.error('Enter a valid 10-digit phone number');

    setIsLoading(true);
    try {
      const verifier = await setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, `+91${normalized}`, verifier);
      setConfirmationResult(confirmation);
      toast.success('OTP sent to your phone');
      setStep(2);
    } catch (err) {
      toast.error(err?.message || 'Could not send OTP. Please try again.');
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch { /* already cleared */ }
        window.recaptchaVerifier = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter the 6-digit OTP');
    if (!confirmationResult) return toast.error('Please request an OTP first');

    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      setIdToken(await result.user.getIdToken());
      setStep(3);
    } catch (err) {
      if (err.code === 'auth/invalid-verification-code') toast.error('Invalid OTP');
      else if (err.code === 'auth/code-expired') toast.error('OTP expired. Please request a new one.');
      else toast.error(err?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Both passwords must match');

    setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { idToken, role, newPassword: password });
      login(res.data.user, res.data.token);
      toast.success('Password updated. You are signed in.');
      navigate(res.data.user.role === 'worker' ? '/worker-dashboard' : '/customer-dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = 'w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-primary focus:outline-none';

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <Helmet>
        <title>Reset your password | KaamMitra</title>
      </Helmet>

      <div className="bg-card-white rounded-3xl shadow-sm border border-border-gray p-8">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-text-gray hover:text-primary mb-6">
          <ArrowLeft size={16} /> Back to login
        </Link>

        <h1 className="text-2xl font-extrabold text-navy mb-2">Password bhool gaye?</h1>
        <p className="text-text-gray mb-7">
          {step === 1 && 'Enter your registered phone number and we will send you an OTP.'}
          {step === 2 && `Enter the 6-digit code sent to ${phone}.`}
          {step === 3 && 'Choose a new password for your account.'}
        </p>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label htmlFor="fp-role" className="block text-sm font-bold text-navy mb-2">I am a</label>
              <select
                id="fp-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-gray bg-white focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="customer">Customer</option>
                <option value="worker">Worker</option>
              </select>
            </div>
            <div className="relative">
              <label htmlFor="fp-phone" className="sr-only">Registered phone number</label>
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input
                id="fp-phone" type="tel" required value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit phone number" className={inputClass}
              />
            </div>
            <button
              type="submit" disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-lg py-3 rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="relative">
              <label htmlFor="fp-otp" className="sr-only">6-digit OTP</label>
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input
                id="fp-otp" type="text" inputMode="numeric" required maxLength={6} value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className={`${inputClass} text-center tracking-widest text-lg`}
              />
            </div>
            <button
              type="submit" disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-lg py-3 rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button" onClick={() => setStep(1)}
              className="w-full text-sm text-text-gray hover:text-primary font-medium"
            >
              Change phone number
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleReset} className="space-y-5">
            <div className="relative">
              <label htmlFor="fp-new" className="sr-only">New password</label>
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input
                id="fp-new" type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password (min 6 characters)" className={inputClass}
              />
            </div>
            <div className="relative">
              <label htmlFor="fp-confirm" className="sr-only">Confirm new password</label>
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input
                id="fp-confirm" type="password" required value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password" className={inputClass}
              />
            </div>
            <button
              type="submit" disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-lg py-3 rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default ForgotPassword;
