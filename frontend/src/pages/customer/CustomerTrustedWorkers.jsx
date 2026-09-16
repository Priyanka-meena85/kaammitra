import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import WorkerCard from '../../components/customer/WorkerCard';

const CustomerTrustedWorkers = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-slate-100 shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Trusted Workers</h1>
      </div>
      
      <div className="p-4 pt-6">
        <WorkerCard 
          id="101"
          name="Rahul Sharma"
          service="Plumbing Specialist"
          rating={4.8}
          distance={1.2}
          available={true}
          price={299}
        />
        <WorkerCard 
          id="102"
          name="Amit Verma"
          service="Electrical Expert"
          rating={4.9}
          distance={2.5}
          available={false}
          price={199}
        />
      </div>
    </div>
  );
};

export default CustomerTrustedWorkers;
