import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, IndianRupee, Settings, User, CheckCircle, XCircle, PhoneCall, MessageCircle, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';
import { extractArray } from '../utils/apiResponse';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  
  const [workerData, setWorkerData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [workerRes, bookingsRes, leadsRes] = await Promise.all([
          api.get(`/workers/${user._id}`),
          api.get(`/bookings/worker/${user._id}`),
          api.get(`/leads?workerId=${user._id}`)
        ]);
        
        setWorkerData(workerRes.data.data);
        setBookings(extractArray(bookingsRes, ["bookings"]));
        
        // Demo fallback for leads since lead logic might not be fully seeded
        setLeads(extractArray(leadsRes, ["leads"]));
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        if (err.isWakingUp) setApiError('Server is waking up. Please wait 30 seconds and try again.');
        if(err.message === 'Network Error') {
            toast.error('Network error loading dashboard');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleBookingStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
      toast.success(`Booking status updated to ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleLeadStatus = async (id, status) => {
    try {
      await api.patch(`/leads/${id}/status`, { status });
      setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
      toast.success(`Lead marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update lead');
    }
  };

  const handleAvailabilityToggle = async () => {
    if(!workerData) return;
    try {
      setIsUpdating(true);
      const newStatus = !workerData.isAvailable;
      const res = await api.patch(`/workers/${user._id}/availability`, { isAvailable: newStatus });
      setWorkerData(res?.data?.data || null);
      toast.success(`Status updated to ${newStatus ? 'Available' : 'Busy'}`);
    } catch (err) {
      toast.error('Failed to update availability');
    } finally {
      setIsUpdating(false);
    }
  };

  const saveWorkingHours = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      data.emergencyAvailable = formData.get('emergencyAvailable') === 'on';
      
      const res = await api.patch(`/workers/${user._id}/working-hours`, data);
      setWorkerData(res?.data?.data || null);
      toast.success('Working hours and settings saved');
    } catch(err) {
      toast.error('Failed to save settings');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-text-gray font-medium">Loading dashboard...</div>;
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
  if (!workerData) return <div className="text-center py-20 text-red-500 font-bold">Worker data not found. Please contact support.</div>;

  const pendingBookings = (Array.isArray(bookings) ? bookings : []).filter(b => b.status === 'Pending');
  const activeBookings = (Array.isArray(bookings) ? bookings : []).filter(b => ['Accepted', 'On the Way', 'In Progress'].includes(b.status));
  const completedJobs = (Array.isArray(bookings) ? bookings : []).filter(b => b.status === 'Completed').length;
  
  const newLeads = (Array.isArray(leads) ? leads : []).filter(l => l.status === 'New');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Verification Status */}
      <div className="bg-card-white rounded-3xl shadow-lg border border-border-gray overflow-hidden">
        <div className="bg-navy p-6 md:p-8 flex flex-col md:flex-row justify-between items-center text-white">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{workerData.name}</h1>
              <p className="text-blue-200">{(Array.isArray(workerData.services) ? workerData.services : []).join(', ')}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
             <button 
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl transition font-medium"
              >
                Logout
              </button>
          </div>
        </div>
        
        <div className="p-6 md:p-8 bg-white flex flex-wrap gap-4 border-b border-border-gray">
          {workerData.verificationStatus === 'Pending Verification' ? (
            <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-lg font-bold border border-orange-200 w-full md:w-auto">
              <AlertCircle size={20} /> Profile Pending Verification
            </div>
          ) : workerData.verificationStatus === 'Verified' ? (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg font-bold border border-green-200">
              <CheckCircle size={20} /> Verified Worker
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-4 py-2 rounded-lg font-bold border border-gray-200">
              Status: {workerData.verificationStatus}
            </div>
          )}

          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border ${workerData.phoneVerified ? 'border-green-300 text-green-700 bg-green-50' : 'border-gray-200 text-gray-400'}`}>
            {workerData.phoneVerified && <CheckCircle size={14}/>} Phone
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border ${workerData.idVerified ? 'border-green-300 text-green-700 bg-green-50' : 'border-gray-200 text-gray-400'}`}>
            {workerData.idVerified && <CheckCircle size={14}/>} ID
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border ${workerData.areaVerified ? 'border-green-300 text-green-700 bg-green-50' : 'border-gray-200 text-gray-400'}`}>
            {workerData.areaVerified && <CheckCircle size={14}/>} Area
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Col: Availability & Stats */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6">
            <h2 className="text-xl font-bold text-navy mb-4">Availability</h2>
            <div className="flex justify-between items-center mb-6">
              <span className="font-medium text-text-gray">Current Status</span>
              <button 
                onClick={handleAvailabilityToggle}
                disabled={isUpdating}
                className={`px-6 py-2 rounded-full font-bold shadow-sm transition-colors ${workerData.isAvailable ? 'bg-accent-green text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                {workerData.isAvailable ? 'Available' : 'Busy'}
              </button>
            </div>

            <form onSubmit={saveWorkingHours} className="space-y-4 pt-4 border-t border-border-gray">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Start Time</label>
                <input type="time" name="workingHoursStart" defaultValue={workerData.workingHoursStart} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">End Time</label>
                <input type="time" name="workingHoursEnd" defaultValue={workerData.workingHoursEnd} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Weekly Off</label>
                <select name="weeklyOffDay" defaultValue={workerData.weeklyOffDay} className="w-full p-2 border rounded-lg">
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                  <option value="None">None</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" name="emergencyAvailable" id="emergencyAvailable" defaultChecked={workerData.emergencyAvailable} className="w-4 h-4 rounded text-primary focus:ring-primary" />
                <label htmlFor="emergencyAvailable" className="text-sm font-medium text-navy">Emergency Ready (24x7/Urgent)</label>
              </div>
              <button disabled={isUpdating} type="submit" className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-lg font-bold transition">
                Save Settings
              </button>
            </form>
          </div>

          <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6">
            <h2 className="text-xl font-bold text-navy mb-4">Profile Growth</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Trust Score</span>
                  <span className="font-bold text-green-600">{workerData.trustScore}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{width: `${workerData.trustScore}%`}}></div></div>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="text-text-gray">Completed Jobs</span>
                <span className="font-bold">{completedJobs}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="text-text-gray">Rating</span>
                <span className="font-bold flex items-center gap-1"><Star size={16} className="text-yellow-400 fill-yellow-400"/> {workerData.averageRating || 'New'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: CRM (Leads, Pending, Active) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Today's Leads */}
          <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray overflow-hidden">
             <div className="bg-gray-50 p-4 border-b border-border-gray flex justify-between items-center">
                <h2 className="text-lg font-bold text-navy flex items-center gap-2"><PhoneCall size={20}/> Today's Direct Leads</h2>
                <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">{newLeads.length} New</span>
             </div>
             <div className="p-4">
                {newLeads.length === 0 ? (
                  <EmptyState message="No direct calls or WhatsApp leads today." />
                ) : (
                  <div className="space-y-3">
                    {newLeads.map(l => (
                      <div key={l._id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-gray-50">
                        <div>
                           <p className="font-bold">{l.customerPhone || 'Hidden'}</p>
                           <p className="text-xs text-gray-500">Source: {l.source}</p>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => handleLeadStatus(l._id, 'Contacted')} className="px-3 py-1 bg-primary text-white text-sm rounded font-medium">Contacted</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>

          {/* Pending Bookings */}
          <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray overflow-hidden">
             <div className="bg-gray-50 p-4 border-b border-border-gray">
                <h2 className="text-lg font-bold text-navy flex items-center gap-2"><Briefcase size={20}/> Booking Requests</h2>
             </div>
             <div className="p-4">
                {pendingBookings.length === 0 ? (
                  <EmptyState message="No pending booking requests right now." />
                ) : (
                  <div className="space-y-4">
                    {pendingBookings.map(b => (
                      <div key={b._id} className="border border-border-gray p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-navy">{b.service}</p>
                            <p className="text-sm text-text-gray flex items-center gap-1"><Clock size={14}/> {new Date(b.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-bold">New Request</span>
                        </div>
                        <p className="text-sm mb-4 border-l-2 border-primary pl-2 text-gray-700">{b.description || b.problem || 'No description provided'}</p>
                        <div className="flex gap-2">
                          <button onClick={() => handleBookingStatus(b._id, 'Accepted')} className="flex-1 bg-accent-green text-white py-2 rounded-lg font-bold hover:bg-green-700 transition shadow-sm">Accept</button>
                          <button onClick={() => handleBookingStatus(b._id, 'Rejected')} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 transition shadow-sm">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>

          {/* Active Jobs */}
          <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray overflow-hidden">
             <div className="bg-gray-50 p-4 border-b border-border-gray">
                <h2 className="text-lg font-bold text-navy flex items-center gap-2"><Settings size={20}/> Active Jobs</h2>
             </div>
             <div className="p-4">
                {activeBookings.length === 0 ? (
                  <EmptyState message="No active jobs. Accept requests to start working." />
                ) : (
                  <div className="space-y-4">
                    {activeBookings.map(b => (
                      <div key={b._id} className="border border-border-gray p-4 rounded-xl bg-blue-50/50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-navy">{b.service}</p>
                            <p className="text-sm text-text-gray">{b.address || 'Location hidden until accepted'}</p>
                          </div>
                          <span className="text-xs bg-primary text-white px-2 py-1 rounded font-bold">{b.status}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-100">
                          {b.status === 'Accepted' && <button onClick={() => handleBookingStatus(b._id, 'On the Way')} className="bg-primary text-white px-4 py-2 text-sm rounded-lg font-bold shadow-sm">Start Journey (On the Way)</button>}
                          {b.status === 'On the Way' && <button onClick={() => handleBookingStatus(b._id, 'In Progress')} className="bg-accent-orange text-white px-4 py-2 text-sm rounded-lg font-bold shadow-sm">Start Work</button>}
                          {b.status === 'In Progress' && <button onClick={() => handleBookingStatus(b._id, 'Completed')} className="bg-accent-green text-white px-4 py-2 text-sm rounded-lg font-bold shadow-sm">Mark Completed</button>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
