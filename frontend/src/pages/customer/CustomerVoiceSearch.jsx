import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, X, Loader2 } from 'lucide-react';
import { parseVoiceInput } from '../../api/customerApi';
import toast from 'react-hot-toast';

const CustomerVoiceSearch = () => {
  const navigate = useNavigate();
  const [listening, setListening] = useState(true);
  const [text, setText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  
  // Simulate voice recognition to text, then call AI parser
  useEffect(() => {
    // 1. Simulate speech to text taking 2 seconds
    const timer1 = setTimeout(() => setText('Mere ghar ka fan nahi chal raha'), 2000);
    
    // 2. Simulate stopping listening and sending to backend
    const timer2 = setTimeout(async () => {
      setListening(false);
      setProcessing(true);
      
      try {
        // Send actual text to parser
        const res = await parseVoiceInput('Mere ghar ka fan nahi chal raha');
        if (res.success && res.data) {
          setResult(res.data);
          // Automatically route to results after showing the understanding
          setTimeout(() => navigate('/customer/search/results', { state: { text: res.data.problem, service: res.data.service, type: 'voice' } }), 1500);
        } else {
          toast.error("Could not understand the problem. Please try again.");
          setListening(true);
          setText('');
        }
      } catch (err) {
        toast.error("Failed to process voice request.");
        setListening(true);
        setText('');
      } finally {
        setProcessing(false);
      }
    }, 4000);
    
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [navigate]);

  return (
    <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      <button onClick={() => navigate(-1)} className="absolute top-6 right-4 p-2 rounded-full hover:bg-white/10 text-white z-20">
        <X size={28} />
      </button>

      {listening && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 bg-orange-500 rounded-full opacity-20 animate-ping"></div>
          <div className="absolute w-48 h-48 bg-orange-500 rounded-full opacity-20 animate-ping" style={{ animationDelay: '0.2s' }}></div>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-sm">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-10 transition-all duration-500 ${listening ? 'bg-orange-500 scale-110 shadow-[0_0_40px_rgba(37,99,235,0.6)]' : 'bg-slate-700'}`}>
          <Mic size={40} className="text-white" />
        </div>
        
        {listening ? (
          <>
            <h2 className="text-2xl font-medium text-orange-100 mb-2">Listening...</h2>
            <p className="text-slate-400 font-medium mb-12">अपनी समस्या बताएं</p>
            <div className="flex gap-2 h-8 items-center">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-2 bg-orange-400 rounded-full animate-pulse" style={{ height: `${Math.random() * 100 + 20}%`, animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
            
            {text && (
              <div className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-4 w-full animate-in fade-in slide-in-from-bottom-4">
                <p className="text-lg font-medium">"{text}"</p>
              </div>
            )}
          </>
        ) : processing ? (
          <div className="flex flex-col items-center animate-in fade-in">
            <Loader2 size={32} className="text-orange-400 animate-spin mb-4" />
            <h2 className="text-xl font-medium text-orange-100 mb-2">Understanding...</h2>
          </div>
        ) : result ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 w-full">
            <h2 className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-2">We understood:</h2>
            <div className="bg-white text-slate-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-center gap-2 mb-2 text-orange-500 font-bold">
                ⚡ {result.service}
              </div>
              <h3 className="text-xl font-black mb-6">{result.problem || 'Repair'}</h3>
              <button 
                onClick={() => navigate('/customer/search/results', { state: { text: result.problem, service: result.service, type: 'voice' } })} 
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl"
              >
                Find Workers
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CustomerVoiceSearch;
