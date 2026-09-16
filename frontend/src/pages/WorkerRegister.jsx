import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Target, Briefcase, Wrench, IndianRupee, Image, FileText, Lock, ShieldCheck } from 'lucide-react';
import { services } from '../data/services';
import { useAuth } from '../context/AuthContext';
import { getUserLocation } from '../utils/location';
import api from '../utils/api';
import toast from 'react-hot-toast';

const WorkerRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('worker');
  
  const handleRoleChange = (newRole) => {
    if (newRole === 'customer') {
      navigate('/register');
    } else {
      setRole(newRole);
    }
  };
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
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

  const handleNextToStep2 = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.serviceCategory || !formData.city || !formData.expectedCharge) {
      return toast.error('Please fill all mandatory fields');
    }
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.profilePhotoUrl || !formData.idDocumentUrl) {
      return toast.error('Please upload required verification documents');
    }

    setIsLoading(true);
    try {
      const payload = {
        role: 'worker',
        ...formData,
        services: [formData.serviceCategory],
        verificationStatus: 'Pending Verification',
        submittedAt: new Date()
      };
      if (payload.phone) {
          payload.phone = payload.phone.replace(/\D/g, '').slice(-10);
      }
      
      const res = await api.post('/auth/register', payload);
      login(res.data.user, res.data.token);
      toast.success('Worker profile submitted for verification');
      navigate('/worker/dashboard');
    } catch(err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="market-hero min-h-[calc(100vh-4rem)] py-8 md:py-12 px-4">
      <div className="max-w-2xl mx-auto">
      <div className="bg-card-white rounded-2xl shadow-xl border border-border-gray p-6 md:p-8">
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

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 space-x-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <div className={`h-1 w-8 md:w-16 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
        </div>

        {step === 1 && (
          <form onSubmit={handleNextToStep2} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                <input aria-label="Full Name" type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full Name" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                <input aria-label="Email Address" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email Address" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                <input aria-label="Create Password" type="password" required minLength="6" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Create Password" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                <input aria-label="Phone Number" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} placeholder="Phone Number (Optional)" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Service Category</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                  <select aria-label="Service Category" required value={formData.serviceCategory} onChange={e => setFormData({...formData, serviceCategory: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none bg-card-white appearance-none">
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
                  <input aria-label="Experience (Years)" type="number" required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} placeholder="e.g. 5" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Expected Charge (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                  <input aria-label="Expected Charge (₹)" type="number" required value={formData.expectedCharge} onChange={e => setFormData({...formData, expectedCharge: e.target.value})} placeholder="e.g. 300" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Skills (Comma separated)</label>
                <input aria-label="Skills (Comma separated)" type="text" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="e.g. AC Repair, Wiring" className="w-full px-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
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

            <button type="submit" className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-primary-hover transition-all mt-8">
              Continue to Document Verification
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister} className="space-y-6">
            <h2 className="text-xl font-bold text-navy mb-4">Verification Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 flex items-center gap-2">
                <Image size={18} className="text-text-gray" /> Profile Photo
              </label>
              <input aria-label="Profile Photo" type="file" onChange={(e) => handleFileUpload(e, 'profilePhotoUrl')} accept="image/*" className="w-full text-sm text-text-gray file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-bg-soft-blue file:text-primary-hover hover:file:bg-bg-soft-blue" />
              {formData.profilePhotoUrl && <p className="text-green-500 text-sm mt-1">✓ Uploaded successfully</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-gray mb-2">Document Type</label>
              <select aria-label="Document Type" value={formData.documentType} onChange={e => setFormData({...formData, documentType: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none bg-white">
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
              <input aria-label="ID Document" type="file" onChange={(e) => handleFileUpload(e, 'idDocumentUrl')} accept="image/*,.pdf" className="w-full text-sm text-text-gray file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-bg-soft-blue file:text-primary-hover hover:file:bg-bg-soft-blue" />
              {formData.idDocumentUrl && <p className="text-green-500 text-sm mt-1">✓ Uploaded successfully</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border-gray">
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Working Hours</label>
                <div className="flex gap-2 items-center">
                  <input aria-label="Working hours start time" type="time" value={formData.workingHoursStart} onChange={e => setFormData({...formData, workingHoursStart: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  <span>to</span>
                  <input aria-label="Working hours end time" type="time" value={formData.workingHoursEnd} onChange={e => setFormData({...formData, workingHoursEnd: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-3 h-full pt-6 cursor-pointer">
                  <input type="checkbox" checked={formData.emergencyAvailable} onChange={e => setFormData({...formData, emergencyAvailable: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm font-medium text-text-gray">Available for Emergency Work</span>
                </label>
              </div>
            </div>

            <button disabled={isLoading} type="submit" className="w-full bg-orange-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-all mt-8 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Submitting...' : 'Submit for Verification'}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => setStep(1)} className="text-text-gray font-medium hover:text-primary">
                Back to Profile
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-text-gray text-sm">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login here</Link>
        </div>
      </div>
      </div>
    </div>
  );
};

export default WorkerRegister;
