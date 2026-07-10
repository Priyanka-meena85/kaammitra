import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Target, Briefcase, Wrench, IndianRupee, Image, FileText, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { services } from '../data/services';
import { useAuth } from '../context/AuthContext';
import { getUserLocation } from '../utils/location';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const WorkerRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  
  // Step 1 State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const setupRecaptcha = async () => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (error) {
        console.warn("Failed to clear old reCAPTCHA", error);
      }
      window.recaptchaVerifier = null;
    }
  
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          console.log("reCAPTCHA verified");
        },
        "expired-callback": () => {
          console.warn("reCAPTCHA expired");
        }
      }
    );
  
    await window.recaptchaVerifier.render();
    return window.recaptchaVerifier;
  };
  
  // Step 2 & 3 State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    serviceCategory: '',
    skills: '',
    experience: '',
    expectedCharge: '',
    city: '',
    area: '',
    address: '',
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    emergencyAvailable: false,
    maxTravelDistance: 10,
    documentType: 'Aadhaar',
    profilePhotoUrl: '',
    idDocumentUrl: ''
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

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    const uploadToast = toast.loading('Uploading document...');
    try {
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ 
        ...prev, 
        [field]: res.data.url,
        [field.replace('Url', 'PublicId')]: res.data.public_id
      }));
      toast.success('Upload complete!', { id: uploadToast });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed', { id: uploadToast });
    }
  };

  const handleSendOtp = async () => {
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    if (normalizedPhone.length !== 10) return toast.error('Please enter a valid 10-digit phone number');
    setIsLoading(true);
    try {
      const appVerifier = await setupRecaptcha();
      const formattedPhone = '+91' + normalizedPhone;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      toast.success('OTP Sent Successfully');
      setResendCountdown(60);
    } catch (err) {
      console.error("Firebase OTP error:", err?.code, err?.message, err);
      toast.error(`Error: ${err?.code || 'Failed to send OTP'} - ${err?.message}`);
      if (window.recaptchaVerifier) {
          try { window.recaptchaVerifier.clear(); } catch(e) {}
          window.recaptchaVerifier = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return toast.error('Please enter a valid 6-digit OTP');
    if (!confirmationResult) return toast.error('Please request OTP first');
    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const token = await result.user.getIdToken();
      setIdToken(token);
      setPhoneVerified(true);
      toast.success('Phone verified successfully');
      setStep(2);
    } catch (err) {
      console.error("Firebase Verification error:", err?.code, err?.message, err);
      if (err.code === 'auth/invalid-verification-code') {
          toast.error('Invalid OTP');
      } else if (err.code === 'auth/code-expired') {
          toast.error('OTP expired. Please request a new one.');
      } else {
          toast.error(err.message || 'Invalid OTP');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextToStep3 = (e) => {
    e.preventDefault();
    if (!formData.serviceCategory || !formData.city || !formData.expectedCharge) {
      return toast.error('Please fill all mandatory fields');
    }
    setStep(3);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!phoneVerified) return toast.error('Please verify your phone number first');
    if (!formData.profilePhotoUrl || !formData.idDocumentUrl) {
      return toast.error('Please upload required verification documents');
    }

    setIsLoading(true);
    try {
      const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
      const payload = {
        role: 'worker',
        idToken,
        ...formData,
        services: [formData.serviceCategory],
        verificationStatus: 'Pending Verification',
        submittedAt: new Date()
      };
      const res = await api.post('/auth/register', payload);
      login(res.data.user, res.data.token);
      toast.success('Worker profile submitted for verification');
      navigate('/worker-dashboard');
    } catch(err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <div className="bg-card-white rounded-3xl shadow-lg border border-border-gray p-6 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Become a KaamMitra</h1>
          <p className="text-text-gray">Register as a worker and start getting jobs near you.</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 space-x-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <div className={`h-1 w-8 md:w-16 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          <div className={`h-1 w-8 md:w-16 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
        </div>

        {step === 1 && (
          <div className="space-y-5 max-w-md mx-auto">
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
              <button disabled={isLoading} onClick={handleSendOtp} className="w-full bg-bg-soft-blue text-primary font-bold text-lg py-3 rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50">
                {isLoading ? 'Sending...' : 'Send OTP'}
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
                <button disabled={isLoading} onClick={handleVerifyOtp} className="w-full bg-primary text-white font-bold text-lg py-3 rounded-xl shadow-md hover:bg-primary-hover transition-all disabled:opacity-50">
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>
                <div className="text-center mt-2">
                  <button 
                    disabled={resendCountdown > 0 || isLoading} 
                    onClick={handleSendOtp} 
                    className={`text-sm font-medium ${resendCountdown > 0 || isLoading ? 'text-gray-400' : 'text-text-gray hover:text-primary'}`}
                  >
                    {resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : 'Resend OTP'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleNextToStep3} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full Name" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={20} />
                <input type="tel" value={phone} readOnly className="w-full pl-10 pr-4 py-3 rounded-xl border border-green-200 bg-green-50 text-navy font-bold focus:outline-none" />
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={20} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email (Optional)" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                <input type="password" required minLength="6" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Create Password" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Service Category</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                  <select required value={formData.serviceCategory} onChange={e => setFormData({...formData, serviceCategory: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none bg-card-white appearance-none">
                    <option value="">Select Service...</option>
                    {(Array.isArray(services) ? services : []).map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.hindiName})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Experience (Years)</label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                  <input type="number" required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} placeholder="e.g. 5" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Expected Charge (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                  <input type="number" required value={formData.expectedCharge} onChange={e => setFormData({...formData, expectedCharge: e.target.value})} placeholder="e.g. 300" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Skills (Comma separated)</label>
                <input type="text" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="e.g. AC Repair, Wiring" className="w-full px-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
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

            <button type="submit" className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-primary-hover transition-all mt-8">
              Continue to Document Verification
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-6">
            <h2 className="text-xl font-bold text-navy mb-4">Verification Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 flex items-center gap-2">
                <Image size={18} className="text-text-gray" /> Profile Photo
              </label>
              <input type="file" onChange={(e) => handleFileUpload(e, 'profilePhotoUrl')} accept="image/*" className="w-full text-sm text-text-gray file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-bg-soft-blue file:text-primary-hover hover:file:bg-bg-soft-blue" />
              {formData.profilePhotoUrl && <p className="text-green-500 text-sm mt-1">✓ Uploaded successfully</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-gray mb-2">Document Type</label>
              <select value={formData.documentType} onChange={e => setFormData({...formData, documentType: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none bg-white">
                <option value="Aadhaar">Aadhaar</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Driving License">Driving License</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 flex items-center gap-2">
                <FileText size={18} className="text-text-gray" /> ID Document
              </label>
              <input type="file" onChange={(e) => handleFileUpload(e, 'idDocumentUrl')} accept="image/*,.pdf" className="w-full text-sm text-text-gray file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-bg-soft-blue file:text-primary-hover hover:file:bg-bg-soft-blue" />
              {formData.idDocumentUrl && <p className="text-green-500 text-sm mt-1">✓ Uploaded successfully</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border-gray">
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Working Hours</label>
                <div className="flex gap-2 items-center">
                  <input type="time" value={formData.workingHoursStart} onChange={e => setFormData({...formData, workingHoursStart: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  <span>to</span>
                  <input type="time" value={formData.workingHoursEnd} onChange={e => setFormData({...formData, workingHoursEnd: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-3 h-full pt-6 cursor-pointer">
                  <input type="checkbox" checked={formData.emergencyAvailable} onChange={e => setFormData({...formData, emergencyAvailable: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm font-medium text-text-gray">Available for Emergency Work</span>
                </label>
              </div>
            </div>

            <button disabled={isLoading || !phoneVerified} type="submit" className="w-full bg-orange-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-all mt-8 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Submitting...' : 'Submit for Verification'}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => setStep(2)} className="text-text-gray font-medium hover:text-primary">
                Back to Profile
              </button>
            </div>
          </form>
        )}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default WorkerRegister;
