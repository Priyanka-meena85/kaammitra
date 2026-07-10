import React, { useState, useEffect } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';

const InstallAppPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user already dismissed
    const isDismissed = localStorage.getItem('pwa_prompt_dismissed');
    
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-2xl p-4 border border-primary z-50 flex items-center justify-between animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-full text-primary">
          <FaDownload size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900">Install KaamMitra</h4>
          <p className="text-xs text-gray-600">For quick access and better experience</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={handleInstallClick}
          className="text-xs bg-primary text-white px-3 py-1.5 rounded font-medium hover:bg-primary-dark transition-colors"
        >
          Install
        </button>
        <button 
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 p-1"
          aria-label="Dismiss"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default InstallAppPrompt;
