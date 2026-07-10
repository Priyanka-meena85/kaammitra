import React, { useState, useEffect } from 'react';
import { getAdminSafetyReports, updateSafetyReport } from '../../api/safetyApi';
import { getAdminReviews, moderateReview } from '../../api/reviewApi';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const AdminTrustSafety = () => {
    const [reports, setReports] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [activeTab, setActiveTab] = useState('reports');
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            const res = await getAdminSafetyReports({ status: 'open' });
            setReports(res.data.data.reports || []);
        } catch (error) {
            toast.error('Failed to load safety reports');
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await getAdminReviews({ status: 'pending_moderation' });
            setReviews(res.data.data.reviews || []);
        } catch (error) {
            toast.error('Failed to load reviews');
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            if (activeTab === 'reports') await fetchReports();
            if (activeTab === 'reviews') await fetchReviews();
            setLoading(false);
        };
        loadData();
    }, [activeTab]);

    const handleResolveReport = async (id, status) => {
        try {
            await updateSafetyReport(id, { status, adminNote: 'Reviewed by admin' });
            toast.success(`Report ${status}`);
            fetchReports();
        } catch (err) {
            toast.error('Action failed');
        }
    };

    const handleModerateReview = async (id, status) => {
        try {
            await moderateReview(id, { status, moderationNote: 'Admin moderated' });
            toast.success(`Review set to ${status}`);
            fetchReviews();
        } catch (err) {
            toast.error('Action failed');
        }
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Trust & Safety Hub</h1>
                <p className="text-gray-500 mt-1">Monitor risk, moderate reviews, and resolve safety incidents.</p>
            </div>

            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('reports')}
                    className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'reports' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Safety Reports
                </button>
                <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'reviews' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Review Moderation
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            ) : (
                <>
                    {activeTab === 'reports' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {reports.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No open safety reports.</div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type / Severity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reports.map((r) => (
                                            <tr key={r._id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {format(new Date(r.createdAt), 'dd MMM yyyy, HH:mm')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 capitalize">{r.type.replace('_', ' ')}</div>
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${r.severity === 'critical' ? 'bg-red-100 text-red-800' : r.severity === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {r.severity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                    {r.description}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {r.targetRole}
                                                    <div className="text-xs text-gray-400 font-mono">{r.targetId.substring(0, 8)}...</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleResolveReport(r._id, 'resolved')} className="text-green-600 hover:text-green-900 mr-3">Resolve</button>
                                                    <button onClick={() => handleResolveReport(r._id, 'rejected')} className="text-gray-400 hover:text-gray-600">Reject</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {reviews.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No reviews pending moderation.</div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer / Target</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reviews.map((r) => (
                                            <tr key={r._id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {format(new Date(r.createdAt), 'dd MMM yyyy, HH:mm')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div>{r.reviewerRole} → {r.targetRole}</div>
                                                    <div className="text-xs text-gray-400">Rating: {r.rating}★</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-sm">
                                                    {r.comment}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-bold text-red-600">
                                                    {r.reportedCount}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleModerateReview(r._id, 'visible')} className="text-green-600 hover:text-green-900 mr-3">Approve</button>
                                                    <button onClick={() => handleModerateReview(r._id, 'hidden')} className="text-red-600 hover:text-red-900">Hide</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminTrustSafety;
