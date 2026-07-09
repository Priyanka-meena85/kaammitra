import React from 'react';

const TrustCard = ({ icon: Icon, title, description, color = "blue" }) => {
  const colorMap = {
    blue: "bg-bg-soft-blue text-primary",
    green: "bg-accent-green/20 text-accent-green",
    amber: "bg-amber-100 text-amber-600",
    purple: "bg-purple-100 text-purple-600"
  };

  return (
    <div className="flex flex-col items-center text-center p-6 bg-card-white rounded-2xl shadow-sm border border-border-gray">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${colorMap[color]}`}>
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-bold text-navy mb-2">{title}</h3>
      <p className="text-text-gray">{description}</p>
    </div>
  );
};

export default TrustCard;
