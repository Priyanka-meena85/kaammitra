import React from 'react';

const EmptyState = ({ icon: Icon, title, message, actionText, actionClick, actionLink }) => {
  return (
    <div className="bg-card-white rounded-2xl shadow-sm border border-border-gray p-8 text-center flex flex-col items-center justify-center">
      {Icon && (
        <div className="bg-bg-soft-blue text-primary p-4 rounded-full mb-4">
          <Icon size={40} />
        </div>
      )}
      <h3 className="text-xl font-bold text-navy mb-2">{title}</h3>
      <p className="text-text-gray mb-6 max-w-md mx-auto">{message}</p>
      
      {actionText && (
        actionLink ? (
          <a href={actionLink} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded-xl transition-colors shadow-sm">
            {actionText}
          </a>
        ) : (
          <button onClick={actionClick} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded-xl transition-colors shadow-sm">
            {actionText}
          </button>
        )
      )}
    </div>
  );
};

export default EmptyState;
