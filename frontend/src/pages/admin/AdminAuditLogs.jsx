import React, { useState, useEffect } from 'react';
import { getAuditLogs, getAuditLogDetails } from '../../api/auditApi';
import { toast } from 'react-hot-toast';

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    
    // Filters
    const [actorRole, setActorRole] = useState('');
    const [action, setAction] = useState('');
    const [severity, setSeverity] = useState('');
    const [search, setSearch] = useState('');
    const [dateRange, setDateRange] = useState('');

    // Modal
    const [selectedLog, setSelectedLog] = useState(null);

    const fetchLogs = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 20,
                ...(actorRole && { actorRole }),
                ...(action && { action }),
                ...(severity && { severity }),
                ...(search && { search }),
                ...(dateRange && { startDate: getStartDate(dateRange) })
            };
            
            const res = await getAuditLogs(params);
            if (res.data?.success) {
                setLogs(res.data.data.logs);
                setPagination(res.data.data.pagination);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
            toast.error("Failed to fetch audit logs");
        } finally {
            setLoading(false);
        }
    };

    const getStartDate = (range) => {
        const d = new Date();
        if (range === '7d') d.setDate(d.getDate() - 7);
        else if (range === '30d') d.setDate(d.getDate() - 30);
        else if (range === '90d') d.setDate(d.getDate() - 90);
        else return null;
        return d.toISOString();
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchLogs(1);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
        // eslint-disable-next-line
    }, [actorRole, action, severity, search, dateRange]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            fetchLogs(newPage);
        }
    };

    const handleViewDetails = async (id) => {
        try {
            const res = await getAuditLogDetails(id);
            if (res.data?.success) {
                setSelectedLog(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch log details");
        }
    };

    const getSeverityBadge = (level) => {
        switch (level) {
            case 'critical': return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-bold">Critical</span>;
            case 'high': return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-bold">High</span>;
            case 'medium': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-bold">Medium</span>;
            default: return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-bold">Low</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">System Audit Logs</h1>
                    <p className="text-gray-500 mt-1">Track all activities, access, and changes on the platform.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <input 
                    type="text" 
                    placeholder="Search action or description..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none w-full"
                />
                <select value={actorRole} onChange={(e) => setActorRole(e.target.value)} className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full">
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="worker">Worker</option>
                    <option value="customer">Customer</option>
                    <option value="system">System</option>
                </select>
                <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full">
                    <option value="">All Severities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full">
                    <option value="">All Time</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                </select>
                <button onClick={() => { setSearch(''); setActorRole(''); setSeverity(''); setDateRange(''); setAction(''); }} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition font-medium">
                    Reset Filters
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                                <th className="p-4 whitespace-nowrap">Timestamp</th>
                                <th className="p-4">Actor</th>
                                <th className="p-4">Action</th>
                                <th className="p-4">Severity</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">No audit logs found matching the criteria.</td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="p-4 text-gray-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-800">{log.actorName || 'System'}</div>
                                            <div className="text-xs text-gray-500 uppercase">{log.actorRole}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-700 text-xs bg-gray-100 inline-block px-2 py-1 rounded">{log.action}</div>
                                        </td>
                                        <td className="p-4">
                                            {getSeverityBadge(log.severity)}
                                        </td>
                                        <td className="p-4 text-gray-600 truncate max-w-xs" title={log.description}>{log.description}</td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => handleViewDetails(log._id)}
                                                className="text-primary hover:text-blue-800 font-medium text-xs underline"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                        <span className="text-sm text-gray-500">Showing {logs.length} of {pagination.total} records</span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-3 py-1 bg-white border border-gray-300 rounded text-sm disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="px-3 py-1 font-medium text-sm text-gray-700">Page {pagination.page} of {pagination.pages}</span>
                            <button 
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                                className="px-3 py-1 bg-white border border-gray-300 rounded text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Log Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Audit Log Details</h3>
                            <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-xs text-gray-500">Log ID</p><p className="text-sm font-medium">{selectedLog._id}</p></div>
                                <div><p className="text-xs text-gray-500">Timestamp</p><p className="text-sm font-medium">{new Date(selectedLog.createdAt).toLocaleString()}</p></div>
                                
                                <div><p className="text-xs text-gray-500">Actor</p><p className="text-sm font-medium">{selectedLog.actorName || 'System'} ({selectedLog.actorRole})</p></div>
                                <div><p className="text-xs text-gray-500">Actor ID</p><p className="text-sm font-medium">{selectedLog.actorId || 'N/A'}</p></div>
                                
                                <div><p className="text-xs text-gray-500">Action</p><p className="text-sm font-bold text-gray-700 bg-gray-100 inline-block px-2 py-0.5 mt-1 rounded">{selectedLog.action}</p></div>
                                <div><p className="text-xs text-gray-500">Severity</p><div className="mt-1">{getSeverityBadge(selectedLog.severity)}</div></div>
                                
                                <div><p className="text-xs text-gray-500">Entity Type</p><p className="text-sm font-medium">{selectedLog.entityType || 'N/A'}</p></div>
                                <div><p className="text-xs text-gray-500">Entity ID</p><p className="text-sm font-medium break-all">{selectedLog.entityId || 'N/A'}</p></div>
                                
                                <div><p className="text-xs text-gray-500">IP Address</p><p className="text-sm font-medium">{selectedLog.ipAddress || 'Unknown'}</p></div>
                            </div>
                            
                            <div className="pt-2">
                                <p className="text-xs text-gray-500">Description</p>
                                <p className="text-sm font-medium bg-gray-50 p-3 rounded mt-1 border border-gray-100">{selectedLog.description}</p>
                            </div>
                            
                            <div className="pt-2">
                                <p className="text-xs text-gray-500">User Agent</p>
                                <p className="text-xs text-gray-600 mt-1 break-all bg-gray-50 p-2 rounded">{selectedLog.userAgent || 'Unknown'}</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 text-right rounded-b-xl">
                            <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium text-sm transition">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAuditLogs;
