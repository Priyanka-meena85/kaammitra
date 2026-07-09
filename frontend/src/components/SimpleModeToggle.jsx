import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';

const SimpleModeToggle = () => {
  const [isSimpleMode, setIsSimpleMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('kaammitra_simple_mode');
    if (saved === 'true') {
      setIsSimpleMode(true);
      document.body.classList.add('simple-mode');
    }
  }, []);

  const toggleMode = () => {
    const newMode = !isSimpleMode;
    setIsSimpleMode(newMode);
    localStorage.setItem('kaammitra_simple_mode', newMode.toString());
    
    if (newMode) {
      document.body.classList.add('simple-mode');
    } else {
      document.body.classList.remove('simple-mode');
    }

    // Force a re-render of components listening to localStorage or just reload for prototype
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <button 
      onClick={toggleMode}
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
