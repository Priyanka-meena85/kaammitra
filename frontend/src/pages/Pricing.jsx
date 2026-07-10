import React, { useState } from 'react';
import { Check, Star, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Pricing = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [billingCycle, setBillingCycle] = useState('monthly');

    const handleSubscribe = async (planName, price) => {
        if (!user) {
            toast.error('Please login to subscribe');
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/payments/subscription/create', { planId: 'plan_mock_123' });
            
            // Mock razorpay popup simulation
            toast.success(`Successfully subscribed to ${planName}!`);
            await api.post('/payments/subscription/verify', { 
                razorpay_subscription_id: res.data.data.subscriptionId,
                planName,
                planType: billingCycle,
                amount: price
            });

            // Reload to fetch updated user details
            window.location.reload();

        } catch (error) {
            toast.error('Failed to process subscription');
        } finally {
            setLoading(false);
        }
    };

    const isCustomer = !user || user.role === 'customer';
    const isWorker = user && user.role === 'worker';

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-navy mb-4">Upgrade Your KaamMitra Experience</h1>
                <p className="text-lg text-text-gray max-w-2xl mx-auto">Get more out of the platform with our premium subscriptions. Choose the plan that fits your needs.</p>
                
                <div className="mt-8 flex justify-center items-center gap-4">
                    <span className={`font-bold ${billingCycle === 'monthly' ? 'text-navy' : 'text-gray-400'}`}>Monthly</span>
                    <button 
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                        className="w-14 h-7 bg-blue-100 rounded-full flex items-center p-1 relative"
                    >
                        <div className={`w-5 h-5 bg-primary rounded-full absolute transition-all ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`}></div>
                    </button>
                    <span className={`font-bold flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-navy' : 'text-gray-400'}`}>
                        Yearly <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Save 20%</span>
                    </span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Customer Plan */}
                {(isCustomer || !user) && (
                    <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-500 overflow-hidden relative transform hover:-translate-y-2 transition-all">
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">POPULAR</div>
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-navy mb-2 flex items-center gap-2"><Star className="text-blue-500"/> KaamMitra Plus</h2>
                            <p className="text-text-gray mb-6">For Customers</p>
                            <div className="mb-8">
                                <span className="text-5xl font-extrabold text-navy">₹{billingCycle === 'monthly' ? '199' : '1899'}</span>
                                <span className="text-text-gray font-medium">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3"><Check className="text-green-500 shrink-0"/> <span className="font-medium">Zero Platform Fees</span></li>
                                <li className="flex items-center gap-3"><Check className="text-green-500 shrink-0"/> <span className="font-medium">Priority Booking Access</span></li>
                                <li className="flex items-center gap-3"><Check className="text-green-500 shrink-0"/> <span className="font-medium">24/7 Premium Support</span></li>
                                <li className="flex items-center gap-3"><Check className="text-green-500 shrink-0"/> <span className="font-medium">Exclusive Discounts on Services</span></li>
                            </ul>
                            <button 
                                onClick={() => handleSubscribe('KaamMitra Plus', billingCycle === 'monthly' ? 199 : 1899)}
                                disabled={loading || user?.isSubscribed}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-md disabled:opacity-50"
                            >
                                {user?.isSubscribed ? 'Active Plan' : 'Subscribe Now'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Worker Plan */}
                {(isWorker || !user) && (
                    <div className="bg-gradient-to-br from-gray-900 to-navy text-white rounded-3xl shadow-xl border border-gray-800 overflow-hidden transform hover:-translate-y-2 transition-all relative">
                        <div className="absolute top-0 right-0 bg-yellow-500 text-gray-900 text-xs font-bold px-4 py-1 rounded-bl-lg">PRO</div>
                        <div className="p-8">
                            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Zap className="text-yellow-400 fill-yellow-400"/> Featured Worker</h2>
                            <p className="text-gray-400 mb-6">For Service Providers</p>
                            <div className="mb-8">
                                <span className="text-5xl font-extrabold text-yellow-400">₹{billingCycle === 'monthly' ? '499' : '4799'}</span>
                                <span className="text-gray-400 font-medium">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3"><Check className="text-yellow-400 shrink-0"/> <span className="font-medium">Top Search Ranking in your Area</span></li>
                                <li className="flex items-center gap-3"><Check className="text-yellow-400 shrink-0"/> <span className="font-medium">"Featured Worker" Profile Badge</span></li>
                                <li className="flex items-center gap-3"><Check className="text-yellow-400 shrink-0"/> <span className="font-medium">50% Off Lead Generation Fees</span></li>
                                <li className="flex items-center gap-3"><Check className="text-yellow-400 shrink-0"/> <span className="font-medium">Priority Dispute Resolution</span></li>
                            </ul>
                            <button 
                                onClick={() => handleSubscribe('Featured Worker', billingCycle === 'monthly' ? 499 : 4799)}
                                disabled={loading || user?.isSubscribed}
                                className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-extrabold py-4 rounded-xl transition shadow-lg shadow-yellow-500/20 disabled:opacity-50"
                            >
                                {user?.isSubscribed ? 'Active Plan' : 'Boost My Profile'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pricing;