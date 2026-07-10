import React, { useState } from 'react';
import { createSafetyReport } from '../api/safetyApi';
import { toast } from 'react-hot-toast';

const SafetyReportModal = ({ isOpen, onClose, targetId, targetRole, bookingId }) => {
    const [type, setType] = useState('unsafe_behavior');
    const [severity, setSeverity] = useState('medium');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createSafetyReport({
                targetId,
                targetRole,
                bookingId,
                type,
                severity,
                description
            });
            toast.success('Safety report submitted. Our team will review it shortly.');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-red-600">Report Safety Issue</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                        <select 
                            value={type} 
                            onChange={(e) => setType(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-gray-50"
                        >
                            <option value="unsafe_behavior">Unsafe Behavior</option>
                            <option value="harassment">Harassment</option>
                            <option value="fraud">Fraud / Scam</option>
                            <option value="payment_issue">Payment Issue</option>
                            <option value="fake_profile">Fake Profile</option>
                            <option value="overcharging">Overcharging</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                        <select 
                            value={severity} 
                            onChange={(e) => setSeverity(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-gray-50"
                        >
                            <option value="low">Low - Minor Issue</option>
                            <option value="medium">Medium - Concerning</option>
                            <option value="high">High - Dangerous/Urgent</option>
                            <option value="critical">Critical - Immediate Action Required</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="4"
                            required
                            placeholder="Please provide specific details about the incident..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                        ></textarea>
                    </div>

                    <p className="text-xs text-gray-500 italic">
                        By submitting this report, you confirm the information provided is true. False reporting may lead to account suspension.
                    </p>

                    <div className="flex gap-3 pt-4">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium text-sm transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SafetyReportModal;
