import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, FileText, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy">Admin Dashboard</h1>
          <p className="text-text-gray">Platform Overview</p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('kaammitra_user');
            navigate('/login');
          }}
          className="bg-bg-soft-blue hover:bg-border-gray text-text-gray px-4 py-2 rounded-lg font-medium"
        >
          Logout
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-bg-soft-blue text-primary p-3 rounded-lg"><Users size={24} /></div>
            <span className="text-sm font-bold text-accent-green">+12%</span>
          </div>
          <h2 className="text-text-gray font-medium">Total Customers</h2>
          <p className="text-3xl font-bold text-navy">1,245</p>
        </div>
        <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-orange-100 text-orange-600 p-3 rounded-lg"><Briefcase size={24} /></div>
            <span className="text-sm font-bold text-accent-green">+5%</span>
          </div>
          <h2 className="text-text-gray font-medium">Total Workers</h2>
          <p className="text-3xl font-bold text-navy">320</p>
        </div>
        <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-accent-green/20 text-accent-green p-3 rounded-lg"><FileText size={24} /></div>
            <span className="text-sm font-bold text-accent-green">+18%</span>
          </div>
          <h2 className="text-text-gray font-medium">Total Bookings</h2>
          <p className="text-3xl font-bold text-navy">856</p>
        </div>
        <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-accent-orange/20 text-accent-orange p-3 rounded-lg"><AlertTriangle size={24} /></div>
            <span className="text-sm font-bold text-accent-orange">3 New</span>
          </div>
          <h2 className="text-text-gray font-medium">Open Complaints</h2>
          <p className="text-3xl font-bold text-navy">12</p>
        </div>
      </div>

      <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-6">
        <h2 className="text-xl font-bold text-navy mb-6">Pending Worker Verifications</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-warm text-text-gray text-sm border-b border-border-gray">
                <th className="p-4 font-semibold">Worker Name</th>
                <th className="p-4 font-semibold">Service</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Document</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-gray">
                <td className="p-4 font-medium text-navy">Ramesh Kumar</td>
                <td className="p-4 text-text-gray">Plumber</td>
                <td className="p-4 text-text-gray">9988776655</td>
                <td className="p-4"><a href="#" className="text-primary hover:underline text-sm">View Aadhar</a></td>
                <td className="p-4">
                  <button className="bg-accent-green/20 text-accent-green-hover px-3 py-1 rounded-md text-sm font-bold mr-2 hover:bg-green-200">Approve</button>
                  <button className="bg-accent-orange/20 text-accent-orange-hover px-3 py-1 rounded-md text-sm font-bold hover:bg-red-200">Reject</button>
                </td>
              </tr>
              <tr className="border-b border-border-gray">
                <td className="p-4 font-medium text-navy">Sita Devi</td>
                <td className="p-4 text-text-gray">House Helper</td>
                <td className="p-4 text-text-gray">9123456789</td>
                <td className="p-4"><a href="#" className="text-primary hover:underline text-sm">View Voter ID</a></td>
                <td className="p-4">
                  <button className="bg-accent-green/20 text-accent-green-hover px-3 py-1 rounded-md text-sm font-bold mr-2 hover:bg-green-200">Approve</button>
                  <button className="bg-accent-orange/20 text-accent-orange-hover px-3 py-1 rounded-md text-sm font-bold hover:bg-red-200">Reject</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
