import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Phone, Mail, MapPin } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('customer'); // customer, worker, admin

  const handleLogin = (e) => {
    e.preventDefault();
    // Dummy login logic
    const user = { role, name: role === 'customer' ? 'Aman' : role === 'worker' ? 'Ravi' : 'Admin' };
    localStorage.setItem('kaammitra_user', JSON.stringify(user));
    
    if(role === 'customer') navigate('/customer-dashboard');
    else if(role === 'worker') navigate('/worker-dashboard');
    else navigate('/admin');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-card-white rounded-3xl shadow-lg border border-border-gray p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Welcome Back</h1>
          <p className="text-text-gray">Login to your KaamMitra account</p>
        </div>

        {/* Role Tabs */}
        <div className="flex bg-bg-soft-blue p-1 rounded-xl mb-6">
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${role === 'customer' ? 'bg-card-white text-primary shadow-sm' : 'text-text-gray'}`}
            onClick={() => setRole('customer')}
          >Customer</button>
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${role === 'worker' ? 'bg-card-white text-primary shadow-sm' : 'text-text-gray'}`}
            onClick={() => setRole('worker')}
          >Worker</button>
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${role === 'admin' ? 'bg-card-white text-primary shadow-sm' : 'text-text-gray'}`}
            onClick={() => setRole('admin')}
          >Admin</button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-gray mb-2">Phone or Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input type="text" required placeholder="Enter phone or email" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-gray mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input type="password" required placeholder="Enter password" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>

          <button type="submit" className="w-full bg-primary text-white font-bold text-lg py-3 rounded-xl shadow-lg hover:bg-primary-hover transition-all">
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-text-gray">
          Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
