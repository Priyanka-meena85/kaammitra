import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Settings, User, CheckCircle, PhoneCall, AlertCircle, AlertTriangle, Clock, Bell, Star, MapPin, CalendarDays, TrendingUp, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import EmptyState from '../components/EmptyState';
import { extractArray } from '../utils/apiResponse';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  
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

  // Handle Location Broadcast
  useEffect(() => {
    let watchId = null;
    const onTheWayBookings = (Array.isArray(bookings) ? bookings : []).filter(b => b.status === 'On the Way');
    
    if (onTheWayBookings.length > 0 && socket) {
        if ('geolocation' in navigator) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const location = { lat: position.coords.latitude, lng: position.coords.longitude };
                    onTheWayBookings.forEach(booking => {
                        socket.emit('location_update', { bookingId: booking._id, location });
                    });
                },
                (error) => {
                    console.error("Error watching location: ", error);
                    toast.error("Location tracking failed. Please enable location permissions.");
                },
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
            );
        } else {
            toast.error("Geolocation is not supported by your browser");
        }
    }

    return () => {
        if (watchId !== null && 'geolocation' in navigator) {
            navigator.geolocation.clearWatch(watchId);
        }
    };
  }, [bookings, socket]);

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

  const serviceLabel = (Array.isArray(workerData.services) ? workerData.services : []).join(', ') || 'Local service professional';
  const verificationComplete = workerData.verificationStatus === 'Verified';
  const trustScore = Number(workerData.trustScore || 0);

  return (
    <div className="min-h-screen bg-[#f5f7fa] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] bg-[#10243d] text-white shadow-[0_18px_45px_rgba(16,36,61,0.18)]">
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[32px] border-white/5" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f47b20] shadow-lg shadow-orange-950/20">
                    <User size={30} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9fb5cd]">Worker workspace</p>
                    <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">Good day, {workerData.name}</h1>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#c1d2e4]">
                  <span className="flex items-center gap-2"><Briefcase size={16} /> {serviceLabel}</span>
                  <span className="flex items-center gap-2"><MapPin size={16} /> {workerData.city || 'Your service area'}</span>
                </div>
              </div>
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <button onClick={handleAvailabilityToggle} disabled={isUpdating} className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold transition ${workerData.isAvailable ? 'bg-[#42b883] text-white hover:bg-[#359d70]' : 'bg-white/10 text-[#c1d2e4] hover:bg-white/20'}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${workerData.isAvailable ? 'bg-white' : 'bg-[#9fb5cd]'}`} />
                  {workerData.isAvailable ? 'Available for work' : 'Currently busy'}
                </button>
                <button onClick={() => { logout(); navigate('/login'); }} className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-[#c1d2e4] transition hover:bg-white/10">Log out</button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 border-t border-white/10 sm:grid-cols-4">
            <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-r"><p className="text-xs font-bold uppercase tracking-wider text-[#8fa6bf]">New requests</p><p className="mt-2 text-3xl font-black">{pendingBookings.length}</p></div>
            <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-r"><p className="text-xs font-bold uppercase tracking-wider text-[#8fa6bf]">Active jobs</p><p className="mt-2 text-3xl font-black">{activeBookings.length}</p></div>
            <div className="border-r border-white/10 p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#8fa6bf]">Completed</p><p className="mt-2 text-3xl font-black">{completedJobs}</p></div>
            <div className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#8fa6bf]">Rating</p><p className="mt-2 flex items-center gap-2 text-3xl font-black"><Star size={22} className="fill-[#f7b955] text-[#f7b955]" />{workerData.averageRating || 'New'}</p></div>
          </div>
        </section>

        {workerData.riskLevel === 'high' || workerData.riskLevel === 'critical' ? <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800"><AlertCircle className="mt-0.5 shrink-0" size={20} /><div><p className="font-extrabold">Account needs attention</p><p className="mt-1 text-sm">Your trust score needs improvement. Keep service quality high to protect your account.</p></div></div> : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <main className="space-y-6">
            <section className="rounded-2xl border border-[#dfe5ec] bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-[#e9edf2] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f47b20]">Action queue</p><h2 className="mt-1 flex items-center gap-2 text-xl font-black text-[#10243d]"><Briefcase size={20} /> Booking requests</h2></div>
                <span className="rounded-full bg-[#fff1e5] px-3 py-1.5 text-xs font-extrabold text-[#d75b0c]">{pendingBookings.length} waiting</span>
              </div>
              <div className="p-5 sm:p-6">
                {pendingBookings.length === 0 ? <EmptyState message="No pending booking requests right now." /> : <div className="space-y-3">{pendingBookings.map(b => <div key={b._id} className="rounded-xl border border-[#e3e8ee] p-4 transition hover:border-[#f4b486] hover:shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-extrabold text-[#10243d]">{b.service}</p><p className="mt-1 flex items-center gap-1.5 text-sm text-[#718096]"><CalendarDays size={14} /> {new Date(b.createdAt).toLocaleDateString()}</p></div><span className="w-fit rounded-full bg-[#fff7df] px-3 py-1 text-xs font-bold text-[#a56b00]">New request</span></div><p className="mt-4 border-l-2 border-[#f47b20] pl-3 text-sm leading-6 text-[#526274]">{b.description || b.problem || 'No description provided'}</p><div className="mt-4 flex gap-2"><button onClick={() => handleBookingStatus(b._id, 'Accepted')} className="flex-1 rounded-lg bg-[#23845f] py-2.5 text-sm font-extrabold text-white transition hover:bg-[#1b6c4d]">Accept</button><button onClick={() => handleBookingStatus(b._id, 'Rejected')} className="flex-1 rounded-lg bg-[#f0f3f6] py-2.5 text-sm font-extrabold text-[#526274] transition hover:bg-[#e4e9ee]">Decline</button></div></div>)}</div>}
              </div>
            </section>

            <section className="rounded-2xl border border-[#dfe5ec] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#e9edf2] p-5 sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#23845f]">In progress</p><h2 className="mt-1 flex items-center gap-2 text-xl font-black text-[#10243d]"><Zap size={20} /> Active jobs</h2></div><span className="rounded-full bg-[#e7f6ef] px-3 py-1.5 text-xs font-extrabold text-[#237d5a]">{activeBookings.length} active</span></div>
              <div className="p-5 sm:p-6">{activeBookings.length === 0 ? <EmptyState message="No active jobs. Accept a request to start working." /> : <div className="space-y-3">{activeBookings.map(b => <div key={b._id} className="rounded-xl border border-[#d9e8e1] bg-[#f7fcf9] p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-extrabold text-[#10243d]">{b.service}</p><p className="mt-1 flex items-center gap-1.5 text-sm text-[#718096]"><MapPin size={14} /> {b.address || 'Location hidden until accepted'}</p></div><span className="w-fit rounded-full bg-[#d9f2e6] px-3 py-1 text-xs font-extrabold text-[#237d5a]">{b.status}</span></div><div className="mt-4 border-t border-[#d9e8e1] pt-3">{b.status === 'Accepted' && <button onClick={() => handleBookingStatus(b._id, 'On the Way')} className="rounded-lg bg-[#10243d] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#1b385a]">Start journey <ArrowUpRight className="ml-1 inline" size={16} /></button>}{b.status === 'On the Way' && <div><div className="mb-3 flex items-center gap-2 rounded-lg bg-[#fff4df] px-3 py-2 text-xs font-bold text-[#9a6500]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#f47b20]" /> Broadcasting live location</div><button onClick={() => handleBookingStatus(b._id, 'In Progress')} className="rounded-lg bg-[#f47b20] px-4 py-2.5 text-sm font-extrabold text-white">Start work</button></div>}{b.status === 'In Progress' && <button onClick={() => handleBookingStatus(b._id, 'Completed')} className="rounded-lg bg-[#23845f] px-4 py-2.5 text-sm font-extrabold text-white">Mark completed</button>}</div></div>)}</div>}</div>
            </section>

            <section className="rounded-2xl border border-[#dfe5ec] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-[#e9edf2] p-5 sm:p-6"><h2 className="flex items-center gap-2 text-xl font-black text-[#10243d]"><PhoneCall size={20} /> Direct leads</h2><span className="rounded-full bg-[#fff1e5] px-3 py-1.5 text-xs font-extrabold text-[#d75b0c]">{newLeads.length} new</span></div><div className="p-5 sm:p-6">{newLeads.length === 0 ? <EmptyState message="No direct calls or WhatsApp leads today." /> : <div className="space-y-3">{newLeads.map(l => <div key={l._id} className="flex flex-col gap-3 rounded-xl border border-[#e3e8ee] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-extrabold text-[#10243d]">{l.customerPhone || 'Hidden'}</p><p className="mt-1 text-xs text-[#718096]">Source: {l.source}</p></div><button onClick={() => handleLeadStatus(l._id, 'Contacted')} className="rounded-lg bg-[#10243d] px-4 py-2 text-sm font-extrabold text-white">Mark contacted</button></div>)}</div>}</div></section>
          </main>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-[#dfe5ec] bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#718096]">Profile health</p><h2 className="mt-1 text-xl font-black text-[#10243d]">Build trust</h2></div><ShieldCheck className={verificationComplete ? 'text-[#23845f]' : 'text-[#f47b20]'} size={26} /></div><div className="mb-5 flex items-end justify-between"><span className="text-sm font-semibold text-[#718096]">Trust score</span><strong className={`text-2xl font-black ${trustScore < 40 ? 'text-red-600' : 'text-[#23845f]'}`}>{trustScore}<span className="text-sm text-[#9aa8b7">/100</span></strong></div><div className="h-2.5 overflow-hidden rounded-full bg-[#e9edf2]"><div className={`h-full rounded-full ${trustScore < 40 ? 'bg-red-500' : 'bg-[#42b883]'}`} style={{ width: `${Math.min(100, Math.max(0, trustScore))}%` }} /></div><div className="mt-5 space-y-2 text-sm">{[['Phone', workerData.phoneVerified], ['Identity', workerData.idVerified], ['Service area', workerData.areaVerified]].map(([label, done]) => <div key={label} className="flex items-center justify-between"><span className="text-[#718096]">{label}</span><span className={`flex items-center gap-1 font-bold ${done ? 'text-[#23845f]' : 'text-[#a0acb8]'}`}>{done ? <CheckCircle size={15} /> : <Clock size={15} />}{done ? 'Verified' : 'Pending'}</span></div>)}</div></section>

            <section className="rounded-2xl border border-[#dfe5ec] bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-black text-[#10243d]"><Settings size={20} /> Work settings</h2><CalendarDays size={19} className="text-[#718096]" /></div><form onSubmit={saveWorkingHours} className="space-y-4"><div className="grid grid-cols-2 gap-3"><div><label className="mb-1 block text-xs font-bold text-[#718096]">Starts</label><input aria-label="Start Time" type="time" name="workingHoursStart" defaultValue={workerData.workingHoursStart} className="w-full rounded-lg border border-[#dfe5ec] p-2.5 text-sm" /></div><div><label className="mb-1 block text-xs font-bold text-[#718096]">Ends</label><input aria-label="End Time" type="time" name="workingHoursEnd" defaultValue={workerData.workingHoursEnd} className="w-full rounded-lg border border-[#dfe5ec] p-2.5 text-sm" /></div></div><div><label className="mb-1 block text-xs font-bold text-[#718096]">Weekly off</label><select aria-label="Weekly Off" name="weeklyOffDay" defaultValue={workerData.weeklyOffDay} className="w-full rounded-lg border border-[#dfe5ec] p-2.5 text-sm"><option value="Sunday">Sunday</option><option value="Monday">Monday</option><option value="None">None</option></select></div><label className="flex items-center gap-2 text-sm font-semibold text-[#526274]"><input type="checkbox" name="emergencyAvailable" id="emergencyAvailable" defaultChecked={workerData.emergencyAvailable} className="h-4 w-4 rounded text-[#f47b20] focus:ring-[#f47b20]" /> Emergency-ready</label><button disabled={isUpdating} type="submit" className="w-full rounded-lg bg-[#f47b20] py-2.5 text-sm font-extrabold text-white transition hover:bg-[#d95f0c]">{isUpdating ? 'Saving...' : 'Save settings'}</button></form></section>

            <section className="rounded-2xl bg-[#e8f1fb] p-5 sm:p-6"><div className="flex items-start gap-3"><div className="rounded-xl bg-white p-2 text-[#10243d]"><TrendingUp size={19} /></div><div><h2 className="font-black text-[#10243d]">Keep your profile active</h2><p className="mt-1 text-sm leading-5 text-[#526274]">Respond quickly to requests and keep your availability current.</p><button onClick={() => navigate('/worker/notifications')} className="mt-4 flex items-center gap-2 text-sm font-extrabold text-[#10243d] hover:text-[#f47b20]">View notifications <ArrowUpRight size={16} /></button></div></div></section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
