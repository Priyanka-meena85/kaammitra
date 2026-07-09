import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ComplaintModal = ({ isOpen, onClose, workerId, bookingId = null }) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    "Worker did not come",
    "High price",
    "Bad behavior",
    "Poor work",
    "Fake profile",
    "Other"
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return;
    
    try {
      await api.post('/complaints', {
        customerId: user?._id,
        workerId: workerId,
        bookingId: bookingId,
        reason,
        description
      });
      toast.success('Complaint submitted successfully');
    } catch (err) {
      toast.error('Failed to submit complaint');
      console.error(err);
    }
    
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setReason('');
      setDescription('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h3 className="text-xl font-bold text-navy mb-4">Register Complaint</h3>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-accent-green rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h4 className="text-lg font-bold text-navy">Complaint Registered</h4>
            <p className="text-text-gray mt-2">Our team will investigate and take action shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Reason for Complaint</label>
              <select 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border-border-gray rounded-lg p-3 focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Select a reason</option>
                {reasons.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border-border-gray rounded-lg p-3 h-24 focus:ring-primary focus:border-primary"
                placeholder="Explain the issue..."
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Submit Complaint
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ComplaintModal;
