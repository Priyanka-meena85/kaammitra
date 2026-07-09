import React from 'react';
import { CheckCircle, Circle, Clock, Truck, Hammer, Star } from 'lucide-react';

const StatusTimeline = ({ status }) => {
  const statuses = [
    { id: 'Pending', label: 'Pending', icon: Clock },
    { id: 'Accepted', label: 'Accepted', icon: CheckCircle },
    { id: 'On the Way', label: 'On the Way', icon: Truck },
    { id: 'In Progress', label: 'In Progress', icon: Hammer },
    { id: 'Completed', label: 'Completed', icon: Star },
  ];

  // Find current index
  const currentIndex = statuses.findIndex(s => s.id === status);
  // If cancelled or rejected
  if (status === 'Cancelled' || status === 'Rejected') {
    return (
      <div className="py-2 text-red-600 font-medium">
        Status: {status}
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border-gray -z-10"></div>
        
        {/* Active Line */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent-green -z-10 transition-all duration-500"
          style={{ width: `${currentIndex > 0 ? (currentIndex / (statuses.length - 1)) * 100 : 0}%` }}
        ></div>

        {statuses.map((s, index) => {
          const Icon = s.icon;
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={s.id} className="flex flex-col items-center gap-1 bg-white px-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isActive ? 'bg-accent-green text-white' : 'bg-gray-200 text-gray-400'
              } ${isCurrent ? 'ring-4 ring-accent-green/20' : ''}`}>
                <Icon size={16} />
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-navy' : 'text-gray-400'} hidden sm:block`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
