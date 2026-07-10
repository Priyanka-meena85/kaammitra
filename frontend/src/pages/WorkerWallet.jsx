import React, { useState, useEffect } from 'react';
import { Wallet, IndianRupee, ArrowDownCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getWorkerWallet, requestPayout } from '../api/paymentApi';
import toast from 'react-hot-toast';

const WorkerWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    upiId: ''
  });

  const fetchWallet = async () => {
    try {
      const res = await getWorkerWallet();
      setWallet(res.data);
    } catch (err) {
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handlePayoutRequest = async (e) => {
    e.preventDefault();
    if (!payoutAmount || Number(payoutAmount) < 100) {
      toast.error('Minimum payout amount is ₹100');
      return;
    }
    if (Number(payoutAmount) > wallet?.availableBalance) {
      toast.error('Amount exceeds available balance');
      return;
    }
    if (!bankDetails.accountNumber && !bankDetails.upiId) {
      toast.error('Please provide either Account Number or UPI ID');
      return;
    }

    try {
      await requestPayout({
        amount: Number(payoutAmount),
        bankDetails
      });
      toast.success('Payout requested successfully');
      setPayoutAmount('');
      setBankDetails({ accountHolderName: '', accountNumber: '', ifsc: '', upiId: '' });
      fetchWallet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request payout');
    }
  };

  if (loading) return <div className="text-center py-20 text-text-gray font-medium">Loading wallet...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-navy mb-8 flex items-center gap-2"><Wallet /> My Wallet</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card-white rounded-3xl shadow-sm border border-border-gray p-6">
          <p className="text-text-gray font-medium mb-1">Available Balance</p>
          <h2 className="text-3xl font-bold text-green-600 flex items-center gap-1">
            <IndianRupee size={28} /> {wallet?.availableBalance || 0}
          </h2>
          <p className="text-xs text-text-gray mt-2">Ready for withdrawal</p>
        </div>
        <div className="bg-card-white rounded-3xl shadow-sm border border-border-gray p-6">
          <p className="text-text-gray font-medium mb-1">Pending Balance</p>
          <h2 className="text-3xl font-bold text-orange-500 flex items-center gap-1">
            <IndianRupee size={28} /> {wallet?.pendingBalance || 0}
          </h2>
          <p className="text-xs text-text-gray mt-2">Clears after booking completion</p>
        </div>
        <div className="bg-card-white rounded-3xl shadow-sm border border-border-gray p-6">
          <p className="text-text-gray font-medium mb-1">Total Withdrawn</p>
          <h2 className="text-3xl font-bold text-navy flex items-center gap-1">
            <IndianRupee size={28} /> {wallet?.withdrawnAmount || 0}
          </h2>
          <p className="text-xs text-text-gray mt-2">Lifetime earnings withdrawn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card-white rounded-3xl shadow-sm border border-border-gray p-6">
          <h3 className="text-xl font-bold text-navy mb-4">Request Payout</h3>
          <form onSubmit={handlePayoutRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-gray mb-1">Amount (₹)</label>
              <input 
                type="number" 
                value={payoutAmount}
                onChange={e => setPayoutAmount(e.target.value)}
                className="w-full p-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount (Min ₹100)"
              />
            </div>
            
            <p className="text-xs text-text-gray">Fill Bank Account OR UPI ID</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-gray mb-1">Account Holder</label>
                <input 
                  type="text" 
                  value={bankDetails.accountHolderName}
                  onChange={e => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                  className="w-full p-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-gray mb-1">UPI ID</label>
                <input 
                  type="text" 
                  value={bankDetails.upiId}
                  onChange={e => setBankDetails({...bankDetails, upiId: e.target.value})}
                  className="w-full p-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. name@okhdfcbank"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-gray mb-1">Account Number</label>
                <input 
                  type="text" 
                  value={bankDetails.accountNumber}
                  onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  className="w-full p-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-gray mb-1">IFSC Code</label>
                <input 
                  type="text" 
                  value={bankDetails.ifsc}
                  onChange={e => setBankDetails({...bankDetails, ifsc: e.target.value})}
                  className="w-full p-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl mt-4 transition-colors"
            >
              Submit Request
            </button>
          </form>
        </div>

        <div className="bg-card-white rounded-3xl shadow-sm border border-border-gray p-6 max-h-[500px] overflow-y-auto">
          <h3 className="text-xl font-bold text-navy mb-4">Transaction History</h3>
          {(!wallet?.transactions || wallet.transactions.length === 0) ? (
            <p className="text-text-gray text-center py-8">No transactions yet.</p>
          ) : (
            <div className="space-y-4">
              {[...wallet.transactions].reverse().map((t, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-border-gray pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {t.type === 'earning' && <CheckCircle className="text-green-500" size={20} />}
                    {t.type === 'payout_requested' && <Clock className="text-orange-500" size={20} />}
                    {t.type === 'payout_approved' && <ArrowDownCircle className="text-blue-500" size={20} />}
                    {t.type === 'payout_rejected' && <XCircle className="text-red-500" size={20} />}
                    
                    <div>
                      <p className="font-bold text-navy capitalize">{t.type.replace('_', ' ')}</p>
                      <p className="text-xs text-text-gray">{new Date(t.createdAt).toLocaleDateString()} • {t.description}</p>
                    </div>
                  </div>
                  <div className={`font-bold ${t.type.includes('payout') && !t.type.includes('rejected') ? 'text-red-500' : 'text-green-500'}`}>
                    {t.type.includes('payout') && !t.type.includes('rejected') ? '-' : '+'}₹{t.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerWallet;
