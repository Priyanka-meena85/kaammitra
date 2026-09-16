import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmptyState = ({ icon: Icon, title, message, actionText, actionRoute }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <Icon size={40} className="text-slate-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 mb-8 max-w-xs">{message}</p>
      
      {actionText && actionRoute && (
        <button 
          onClick={() => navigate(actionRoute)}
          className="bg-orange-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl w-full shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
