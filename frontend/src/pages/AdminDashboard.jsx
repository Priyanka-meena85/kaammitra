import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, FileText, AlertTriangle, MapPin, PhoneCall, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  
  const [stats, setStats] = useState({
    customers: 0,
    workers: 0,
    bookings: 0,
    complaints: 0,
  });

  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [callbacks, setCallbacks] = useState([]);
  const [areaRequests, setAreaRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('workers'); // workers, callbacks, areas

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data.data);
        
        const [workersRes, callbacksRes, areasRes] = await Promise.all([
           api.get('/admin/workers'),
           api.get('/callback-requests'),
           api.get('/areas/launch')
        ]);
        
        setPendingWorkers(workersRes.data.data.filter(w => w.verificationStatus === 'Pending Verification' || !w.isVerified));
        setCallbacks(callbacksRes.data.data);
        setAreaRequests(areasRes.data.data);

      } catch (err) {
        console.error('Failed to load admin data', err);
        if(err.message === 'Network Error') {
            toast.error('Network error loading admin data');
        }
      }
    };
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleVerify = async (id, status) => {
    try {
      // Approve means verify and also set status to Verified
      await api.patch(`/admin/workers/${id}/verify`, { isVerified: status === 'approve', verificationStatus: status === 'approve' ? 'Verified' : 'Rejected' });
      setPendingWorkers(prev => prev.filter(w => w._id !== id));
      toast.success(`Worker ${status === 'approve' ? 'approved' : 'rejected'} successfully`);
      setStats(prev => ({...prev, workers: status === 'approve' ? prev.workers + 1 : prev.workers}));
    } catch (err) {
      toast.error('Action failed');
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

  if (loading || !user) return <div className="p-8 text-center">Loading...</div>;

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
          <p className="text-3xl font-bold text-navy">{stats.customers}</p>
        </div>
        <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6 hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-100 text-green-600 p-3 rounded-xl"><Briefcase size={24} /></div>
          </div>
          <h2 className="text-text-gray font-medium">Verified Workers</h2>
          <p className="text-3xl font-bold text-navy">{stats.workers}</p>
        </div>
        <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6 hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl"><FileText size={24} /></div>
          </div>
          <h2 className="text-text-gray font-medium">Total Bookings</h2>
          <p className="text-3xl font-bold text-navy">{stats.bookings}</p>
        </div>
        <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6 hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-orange-100 text-orange-600 p-3 rounded-xl"><AlertTriangle size={24} /></div>
          </div>
          <h2 className="text-text-gray font-medium">Open Complaints</h2>
          <p className="text-3xl font-bold text-navy">{stats.complaints}</p>
        </div>
      </div>

      <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-border-gray bg-gray-50">
            <button 
                onClick={() => setActiveTab('workers')} 
                className={`flex-1 py-4 font-bold text-sm md:text-base transition ${activeTab === 'workers' ? 'bg-white border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-navy'}`}
            >
                Pending Workers ({pendingWorkers.length})
            </button>
            <button 
                onClick={() => setActiveTab('callbacks')} 
                className={`flex-1 py-4 font-bold text-sm md:text-base transition ${activeTab === 'callbacks' ? 'bg-white border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-navy'}`}
            >
                Callback Requests ({callbacks.length})
            </button>
            <button 
                onClick={() => setActiveTab('areas')} 
                className={`flex-1 py-4 font-bold text-sm md:text-base transition ${activeTab === 'areas' ? 'bg-white border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-navy'}`}
            >
                Area Launches ({areaRequests.length})
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
                        {pendingWorkers.length === 0 && (
                            <tr><td colSpan="4" className="p-8 text-center text-text-gray">
                                <EmptyState message="No pending worker verifications." />
                            </td></tr>
                        )}
                        {pendingWorkers.map(worker => (
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
                                    <div className="flex gap-2">
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-bold">ID Uploaded</span>
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-bold">Photo Uploaded</span>
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

            {/* Callbacks Tab */}
            {activeTab === 'callbacks' && (
                <div className="space-y-4">
                    {callbacks.length === 0 && <EmptyState message="No callback requests." />}
                    {callbacks.map(c => (
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
                    {areaRequests.length === 0 && <EmptyState message="No area launch requests." />}
                    {areaRequests.map(a => (
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
