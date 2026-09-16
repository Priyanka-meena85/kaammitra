import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password, role });
      login(res.data.user, res.data.token);
      toast.success('Login successful!');
      navigate(res.data.user.role === 'worker' ? '/worker/dashboard' : (res.data.user.role === 'admin' ? '/admin' : '/customer/dashboard'));
    } catch (err) {
      if (!err.isWakingUp) toast.error(err.response?.data?.error || err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="market-hero min-h-[calc(100vh-4rem)] py-10 md:py-16 px-4">
      <div className="max-w-md mx-auto bg-card-white rounded-2xl shadow-xl border border-border-gray p-6 md:p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-bg-soft-blue text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary mb-2">Your local service account</p>
          <h1 className="text-3xl font-extrabold text-navy mb-2">Welcome back</h1>
          <p className="text-text-gray text-sm">Sign in to manage bookings and connect with your local network.</p>
        </div>

        {/* Role Selection */}
        <div className="mb-6 relative">
          <label className="block text-sm font-bold text-navy mb-2">Select Account Type</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            className="w-full bg-gray-50 border border-border-gray text-navy text-sm font-bold rounded-xl focus:ring-2 focus:ring-primary focus:border-primary block p-3 appearance-none"
          >
            <option value="customer">Customer</option>
            <option value="worker">Worker</option>
            <option value="admin">Admin</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 top-7 flex items-center px-4 text-text-gray">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            {role === 'admin' ? <User className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} /> : <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />}
            <input aria-label={role === 'admin' ? "Username" : "Email Address"} type={role === 'admin' ? 'text' : 'email'} required placeholder={role === 'admin' ? "Username" : "Email Address"} value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-primary" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
            <input aria-label="Password" type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-primary" />
          </div>
          <button disabled={isLoading} type="submit" className="w-full bg-primary text-white font-bold text-lg py-3 rounded-xl shadow-md hover:bg-primary-hover transition-all disabled:opacity-50">
            {isLoading ? 'Loading...' : 'Login'}
          </button>
          {role !== 'admin' && (
            <div className="text-center">
              <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm text-text-gray hover:text-primary font-medium">
                Password bhool gaye?
              </button>
            </div>
          )}
        </form>

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
