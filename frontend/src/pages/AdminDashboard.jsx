import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, FileText, AlertTriangle, MapPin, PhoneCall, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';
import { extractArray } from '../utils/apiResponse';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState({
    customers: 0,
    workers: 0,
    bookings: 0,
    complaints: 0,
  });

  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [callbacks, setCallbacks] = useState([]);
  const [areaRequests, setAreaRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [activeTab, setActiveTab] = useState('workers'); // workers, callbacks, areas, complaints, bookings

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data.data);
        
        const [workersRes, callbacksRes, areasRes, complaintsRes, bookingsRes] = await Promise.all([
           api.get('/admin/workers'),
           api.get('/callback-requests'),
           api.get('/areas/launch'),
           api.get('/admin/complaints'),
           api.get('/admin/bookings')
        ]);
        
        setPendingWorkers(extractArray(workersRes, ["workers"]).filter(w => w.verificationStatus === 'Pending Verification' || !w.isVerified));
        setCallbacks(extractArray(callbacksRes, ["callbacks"]));
        setAreaRequests(extractArray(areasRes, ["areas"]));
        setComplaints(extractArray(complaintsRes, ["complaints"]));
        setBookings(extractArray(bookingsRes, ["bookings"]));

      } catch (err) {
        console.error('Failed to load admin data', err);
        if (err.isWakingUp) setApiError('Server is waking up. Please wait 30 seconds and try again.');
        else toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleVerify = async (id, status) => {
    const note = prompt(`Enter admin notes for ${status === 'approve' ? 'approval' : 'rejection'}:`);
    try {
      await api.patch(`/admin/workers/${id}/verify`, { 
        status: status === 'approve' ? 'Verified' : 'Rejected',
        adminNote: note,
        phoneVerified: true,
        idVerified: status === 'approve',
        areaVerified: true
      });
      setPendingWorkers(prev => prev.filter(w => w._id !== id));
      toast.success(`Worker ${status === 'approve' ? 'approved' : 'rejected'} successfully`);
      if (status === 'approve') setStats(prev => ({...prev, workers: prev.workers + 1}));
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleResolveComplaint = async (id) => {
    const note = prompt(`Enter resolution notes:`);
    if (!note) return;
    try {
      await api.patch(`/admin/complaints/${id}/resolve`, { 
        status: 'Resolved',
        adminNote: note
      });
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: 'Resolved', adminNote: note } : c));
      toast.success(`Complaint resolved`);
      setStats(prev => ({...prev, complaints: prev.complaints - 1}));
    } catch (err) {
      toast.error('Failed to resolve complaint');
    }
  };

  const handleCallbackStatus = async (id, status) => {
      try {
          await api.patch(`/callback-requests/${id}/status`, { status });
          setCallbacks(prev => prev.map(c => c._id === id ? { ...c, status } : c));
          toast.success(`Callback status updated to ${status}`);
      } catch (err) {
          toast.error('Failed to update callback');
      }
  };

  const handleAreaStatus = async (id, status) => {
    try {
        await api.patch(`/areas/launch/${id}/status`, { status });
        setAreaRequests(prev => prev.map(a => a._id === id ? { ...a, status } : a));
        toast.success(`Area request status updated to ${status}`);
    } catch (err) {
        toast.error('Failed to update area request');
    }
  };

  if (loading) return <div className="p-8 text-center text-text-gray font-medium">Loading admin dashboard...</div>;
  if (apiError) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-orange-50 rounded-3xl shadow-sm border border-orange-200 p-12 text-center">
        <AlertTriangle size={64} className="mx-auto text-orange-400 mb-4" />
        <h2 className="text-2xl font-bold text-orange-900 mb-2">{apiError}</h2>
        <p className="text-orange-700 mb-6">Render's free tier sleeps after 15 minutes of inactivity. It takes a moment to spin back up.</p>
        <button onClick={() => window.location.reload()} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md">
          Try Again
        </button>
      </div>
    </div>
  );
  if (!user || user.role !== 'admin') return <div className="p-8 text-center text-red-500">Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Admin Control Center</h1>
          <p className="text-text-gray">Platform Overview and Management</p>
        </div>
        <button 
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="bg-bg-soft-blue hover:bg-border-gray text-text-gray px-6 py-2 rounded-xl font-bold transition shadow-sm"
        >
          Logout
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6 hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-bg-soft-blue text-primary p-3 rounded-xl"><Users size={24} /></div>
          </div>
          <h2 className="text-text-gray font-medium">Total Customers</h2>
          <p className="text-3xl font-bold text-navy">{stats.totalCustomers || stats.customers}</p>
        </div>
        <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6 hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-100 text-green-600 p-3 rounded-xl"><Briefcase size={24} /></div>
          </div>
          <h2 className="text-text-gray font-medium">Total Workers</h2>
          <p className="text-3xl font-bold text-navy">{stats.totalWorkers || stats.workers}</p>
        </div>
        <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6 hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl"><FileText size={24} /></div>
          </div>
          <h2 className="text-text-gray font-medium">Total Bookings</h2>
          <p className="text-3xl font-bold text-navy">{stats.totalBookings || stats.bookings}</p>
        </div>
        <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6 hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-orange-100 text-orange-600 p-3 rounded-xl"><AlertTriangle size={24} /></div>
          </div>
          <h2 className="text-text-gray font-medium">Total Complaints</h2>
          <p className="text-3xl font-bold text-navy">{stats.totalComplaints || stats.complaints}</p>
        </div>
      </div>

      <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-border-gray bg-gray-50 overflow-x-auto whitespace-nowrap">
            <button 
                onClick={() => setActiveTab('workers')} 
                className={`px-6 py-4 font-bold text-sm md:text-base transition ${activeTab === 'workers' ? 'bg-white border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-navy'}`}
            >
                Pending Workers ({(Array.isArray(pendingWorkers) ? pendingWorkers : []).length})
            </button>
            <button 
                onClick={() => setActiveTab('complaints')} 
                className={`px-6 py-4 font-bold text-sm md:text-base transition ${activeTab === 'complaints' ? 'bg-white border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-navy'}`}
            >
                Complaints ({(Array.isArray(complaints) ? complaints : []).filter(c => c.status !== 'Resolved').length})
            </button>
            <button 
                onClick={() => setActiveTab('bookings')} 
                className={`px-6 py-4 font-bold text-sm md:text-base transition ${activeTab === 'bookings' ? 'bg-white border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-navy'}`}
            >
                Bookings ({(Array.isArray(bookings) ? bookings : []).length})
            </button>
            <button 
                onClick={() => setActiveTab('callbacks')} 
                className={`px-6 py-4 font-bold text-sm md:text-base transition ${activeTab === 'callbacks' ? 'bg-white border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-navy'}`}
            >
                Callback Requests ({(Array.isArray(callbacks) ? callbacks : []).length})
            </button>
            <button 
                onClick={() => setActiveTab('areas')} 
                className={`px-6 py-4 font-bold text-sm md:text-base transition ${activeTab === 'areas' ? 'bg-white border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-navy'}`}
            >
                Area Launches ({(Array.isArray(areaRequests) ? areaRequests : []).length})
            </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
            
            {/* Workers Tab */}
            {activeTab === 'workers' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-100 text-text-gray text-sm border-b border-border-gray">
                            <th className="p-4 font-bold rounded-tl-lg">Worker Info</th>
                            <th className="p-4 font-bold">Service & Area</th>
                            <th className="p-4 font-bold">Documents</th>
                            <th className="p-4 font-bold rounded-tr-lg">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {(Array.isArray(pendingWorkers) ? pendingWorkers : []).length === 0 && (
                            <tr><td colSpan="4" className="p-8 text-center text-text-gray">
                                <EmptyState message="No pending worker verifications." />
                            </td></tr>
                        )}
                        {(Array.isArray(pendingWorkers) ? pendingWorkers : []).map(worker => (
                            <tr key={worker._id} className="border-b border-border-gray hover:bg-gray-50">
                                <td className="p-4">
                                    <p className="font-bold text-navy">{worker.name}</p>
                                    <p className="text-sm text-text-gray">{worker.phone}</p>
                                </td>
                                <td className="p-4">
                                    <p className="font-bold text-primary">{worker.services?.[0] || worker.service}</p>
                                    <p className="text-sm text-text-gray flex items-center gap-1"><MapPin size={12}/> {worker.address || worker.area}</p>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        <a href={worker.profilePhotoUrl} target="_blank" rel="noreferrer" className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold hover:underline">View Photo</a>
                                        <a href={worker.idDocumentUrl} target="_blank" rel="noreferrer" className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-bold hover:underline">View {worker.documentType || 'ID'}</a>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleVerify(worker._id, 'approve')} className="bg-accent-green text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-green-700">Approve</button>
                                        <button onClick={() => handleVerify(worker._id, 'reject')} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200">Reject</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Complaints Tab */}
            {activeTab === 'complaints' && (
                <div className="space-y-4">
                    {(Array.isArray(complaints) ? complaints : []).length === 0 && <EmptyState message="No complaints found." />}
                    {(Array.isArray(complaints) ? complaints : []).map(c => (
                        <div key={c._id} className="flex flex-col md:flex-row justify-between items-center p-4 border border-border-gray rounded-xl bg-gray-50">
                            <div>
                                <p className="font-bold text-navy">Type: {c.complaintType}</p>
                                <p className="text-sm text-text-gray mt-1">Desc: {c.description}</p>
                                <p className="text-xs text-primary font-bold mt-2">Status: {c.status}</p>
                                {c.adminNote && <p className="text-xs text-green-700 italic mt-1">Resolution: {c.adminNote}</p>}
                            </div>
                            <div className="mt-4 md:mt-0 flex gap-2">
                                {c.status !== 'Resolved' && <button onClick={() => handleResolveComplaint(c._id)} className="bg-accent-green text-white px-4 py-2 rounded-lg font-bold text-sm">Resolve with Notes</button>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
                <div className="space-y-4">
                    {(Array.isArray(bookings) ? bookings : []).length === 0 && <EmptyState message="No bookings found." />}
                    {(Array.isArray(bookings) ? bookings : []).map(b => (
                        <div key={b._id} className="flex flex-col md:flex-row justify-between items-center p-4 border border-border-gray rounded-xl bg-gray-50">
                            <div>
                                <p className="font-bold text-navy">Service: {b.service || b.serviceId?.name}</p>
                                <p className="text-sm text-text-gray">Customer: {b.customerId?.name} ({b.customerId?.phone})</p>
                                <p className="text-sm text-text-gray">Worker: {b.workerId?.name} ({b.workerId?.phone})</p>
                                <p className="text-xs mt-1">Status: <span className="font-bold">{b.status}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Callbacks Tab */}
            {activeTab === 'callbacks' && (
                <div className="space-y-4">
                    {(Array.isArray(callbacks) ? callbacks : []).length === 0 && <EmptyState message="No callback requests." />}
                    {(Array.isArray(callbacks) ? callbacks : []).map(c => (
                        <div key={c._id} className="flex flex-col md:flex-row justify-between items-center p-4 border border-border-gray rounded-xl bg-gray-50">
                            <div>
                                <p className="font-bold text-navy flex items-center gap-2"><PhoneCall size={16}/> {c.name} - {c.phone}</p>
                                <p className="text-sm text-text-gray">Service: {c.service} | Location: {c.city}, {c.area}</p>
                                {c.note && <p className="text-sm text-gray-700 italic mt-1">Note: {c.note}</p>}
                                <p className="text-xs text-primary font-bold mt-1">Status: {c.status}</p>
                            </div>
                            <div className="mt-4 md:mt-0 flex gap-2">
                                {c.status === 'New' && <button onClick={() => handleCallbackStatus(c._id, 'Contacted')} className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm">Mark Contacted</button>}
                                {(c.status === 'New' || c.status === 'Contacted') && <button onClick={() => handleCallbackStatus(c._id, 'Resolved')} className="bg-accent-green text-white px-4 py-2 rounded-lg font-bold text-sm">Mark Resolved</button>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Areas Tab */}
            {activeTab === 'areas' && (
                <div className="space-y-4">
                    {(Array.isArray(areaRequests) ? areaRequests : []).length === 0 && <EmptyState message="No area launch requests." />}
                    {(Array.isArray(areaRequests) ? areaRequests : []).map(a => (
                        <div key={a._id} className="flex flex-col md:flex-row justify-between items-center p-4 border border-border-gray rounded-xl bg-gray-50">
                            <div>
                                <p className="font-bold text-navy flex items-center gap-2"><MapPin size={16}/> Requested City: {a.city} | Area: {a.area}</p>
                                <p className="text-sm text-text-gray">By: {a.name} ({a.phone}) | Needed: {a.service}</p>
                                <p className="text-xs text-primary font-bold mt-1">Status: {a.status}</p>
                            </div>
                            <div className="mt-4 md:mt-0 flex gap-2">
                                {a.status === 'New' && <button onClick={() => handleAreaStatus(a._id, 'Reviewing')} className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm">Mark Reviewing</button>}
                                {a.status === 'Reviewing' && <button onClick={() => handleAreaStatus(a._id, 'Approved')} className="bg-accent-green text-white px-4 py-2 rounded-lg font-bold text-sm">Mark Approved</button>}
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

export default AdminDashboard;
