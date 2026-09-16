import React from 'react';
import { Wrench, Zap, Sparkles, Snowflake, Hammer, PaintBucket, Smartphone, MoreHorizontal } from 'lucide-react';

const CATEGORIES = [
  { id: 'plumbing', name: 'Plumbing', icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'electrical', name: 'Electrical', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { id: 'cleaning', name: 'Cleaning', icon: Sparkles, color: 'text-teal-500', bg: 'bg-teal-50' },
  { id: 'ac', name: 'AC Repair', icon: Snowflake, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  { id: 'carpenter', name: 'Carpenter', icon: Hammer, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'painting', name: 'Painting', icon: PaintBucket, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'appliance', name: 'Appliance', icon: Smartphone, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'more', name: 'More', icon: MoreHorizontal, color: 'text-slate-500', bg: 'bg-slate-50' },
];

const CategoryGrid = () => {
  return (
    <div className="mb-8">

      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="flex flex-col items-center cursor-pointer group">
            <div className={`w-14 h-14 ${cat.bg} rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 transform group-hover:-translate-y-1`}>
              <cat.icon className={`w-7 h-7 ${cat.color} group-hover:opacity-80 transition-opacity`} />
            </div>
            <span className="text-[11px] font-medium text-slate-600 text-center leading-tight group-hover:text-orange-500 transition-colors">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
