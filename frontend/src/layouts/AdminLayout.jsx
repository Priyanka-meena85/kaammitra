import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminNavbar from '../components/navigation/AdminNavbar';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/admin/analytics': return { title: 'Advanced Analytics', desc: 'Deep dive into platform metrics' };
      case '/admin/reports': return { title: 'Export Reports', desc: 'Download system data in CSV format for analysis' };
      case '/admin/audit-logs': return { title: 'System Audit Logs', desc: 'Track all activities, access, and changes on the platform.' };
      case '/admin/trust-safety': return { title: 'Trust & Safety Hub', desc: 'Monitor risk, moderate reviews, and resolve safety incidents.' };
      case '/admin/notifications': return { title: 'Notifications', desc: 'Manage your alerts' };
      default: return { title: 'Admin Control Center', desc: 'Platform Overview and Management' };
    }
  };

  const { title, desc } = getPageInfo();

  return (
    <div className="flex flex-col min-h-screen bg-bg-warm">
      <AdminNavbar />
      
      {/* Persistent Sub-Header with Colored Actions */}
      <div className="bg-white border-b border-border-gray shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-navy">{title}</h1>
              <p className="text-text-gray">{desc}</p>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4 justify-end">
              {location.pathname !== '/admin' && (
                  <button onClick={() => navigate('/admin')} className="bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl font-bold transition shadow-sm hover:bg-gray-100 text-sm">Overview</button>
              )}
              <button onClick={() => navigate('/admin/analytics')} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-xl font-bold transition shadow-sm hover:bg-indigo-100 text-sm">Analytics</button>
              <button onClick={() => navigate('/admin/reports')} className="bg-purple-50 text-purple-700 border border-purple-200 px-4 py-2 rounded-xl font-bold transition shadow-sm hover:bg-purple-100 text-sm">Reports</button>
              <button onClick={() => navigate('/admin/audit-logs')} className="bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl font-bold transition shadow-sm hover:bg-gray-100 text-sm">Audit Logs</button>
              <button onClick={() => navigate('/admin/trust-safety')} className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-xl font-bold transition shadow-sm hover:bg-red-100 text-sm">Trust & Safety</button>
              <button onClick={() => navigate('/admin/notifications')} className="bg-blue-50 text-primary border border-blue-200 px-4 py-2 rounded-xl font-bold transition shadow-sm flex items-center gap-2 hover:bg-blue-100 text-sm">
                <Bell size={16} /> Alerts
              </button>
              <button onClick={() => { logout(); navigate('/login'); }} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl font-bold transition shadow-sm hover:bg-red-100 text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
