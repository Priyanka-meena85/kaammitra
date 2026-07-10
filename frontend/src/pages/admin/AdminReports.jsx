import React, { useState } from 'react';
import { downloadReport } from '../../api/exportApi';
import { toast } from 'react-hot-toast';

const AdminReports = () => {
    const [dateRange, setDateRange] = useState('30d');
    const [city, setCity] = useState('');
    const [loadingMap, setLoadingMap] = useState({});

    const handleDownload = async (type) => {
        setLoadingMap(prev => ({ ...prev, [type]: true }));
        try {
            await downloadReport(type, { range: dateRange, ...(city && { city }) });
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded successfully`);
        } catch (error) {
            console.error('Download error:', error);
            toast.error(`Failed to download ${type} report`);
        } finally {
            setLoadingMap(prev => ({ ...prev, [type]: false }));
        }
    };

    const reports = [
        { id: 'bookings', title: 'Bookings Report', desc: 'Detailed view of all bookings, statuses, and assigned workers.' },
        { id: 'workers', title: 'Workers Directory', desc: 'Complete list of registered workers, their verification status and trust scores.' },
        { id: 'customers', title: 'Customers Directory', desc: 'Complete list of registered customers.' },
        { id: 'payments', title: 'Payments Log', desc: 'All incoming customer payments and platform fees.' },
        { id: 'payouts', title: 'Payouts Log', desc: 'All worker payout requests, statuses, and bank details.' },
        { id: 'complaints', title: 'Complaints Report', desc: 'All complaints logged, their resolution status, and parties involved.' },
        { id: 'audit-logs', title: 'System Audit Logs', desc: 'Export of system actions, admin activities, and security events.' }
    ];

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Export Reports</h1>
                    <p className="text-gray-500 mt-1">Download system data in CSV format for analysis</p>
                </div>
                
                <div className="flex gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">City Filter</label>
                        <select 
                            value={city} 
                            onChange={(e) => setCity(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-32"
                        >
                            <option value="">All Cities</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Bangalore">Bangalore</option>
                            <option value="Pune">Pune</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label>
                        <select 
                            value={dateRange} 
                            onChange={(e) => setDateRange(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-32"
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 90 Days</option>
                            <option value="1y">Last Year</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.map((report) => (
                    <div key={report.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                        <div>
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
                            <p className="text-sm text-gray-500 mt-2 mb-6">{report.desc}</p>
                        </div>
                        
                        <button
                            onClick={() => handleDownload(report.id)}
                            disabled={loadingMap[report.id]}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-800 font-medium rounded-lg border border-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loadingMap[report.id] ? (
                                <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                    </svg>
                                    Download CSV
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-sm text-blue-800">
                        <strong>Privacy Notice:</strong> Exported reports contain masked sensitive information (e.g. phone numbers, UPI IDs, Bank Accounts) to comply with data privacy policies. Downloaded reports are logged in the system audit trail.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
