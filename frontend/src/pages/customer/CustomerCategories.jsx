import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CategoryGrid from '../../components/customer/CategoryGrid';

const CustomerCategories = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-slate-100 shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">All Services</h1>
      </div>
      
      <div className="p-4 pt-8">
        <CategoryGrid />
      </div>
    </div>
  );
};

export default CustomerCategories;
