import React from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { useSimpleMode } from '../context/SimpleModeContext';

const SimpleModeToggle = () => {
  const { isSimpleMode, toggleSimpleMode } = useSimpleMode();

  return (
    <button 
      onClick={toggleSimpleMode}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
        isSimpleMode 
          ? 'bg-accent-green/10 border-accent-green text-accent-green' 
          : 'bg-white border-border-gray text-text-gray hover:bg-bg-warm'
      }`}
    >
      {isSimpleMode ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
      <span className="font-medium text-sm">आसान मोड (Simple)</span>
    </button>
  );
};

export default SimpleModeToggle;
