import React, { useState } from 'react';
import { Mic, Search } from 'lucide-react';
import { startVoiceRecognition } from '../utils/voice';

const VoiceSearch = ({ onSearch }) => {
  const [isListening, setIsListening] = useState(false);
  const [query, setQuery] = useState('');

  const handleVoiceSearch = () => {
    setIsListening(true);
    startVoiceRecognition(
      (transcript) => {
        setQuery(transcript);
        setIsListening(false);
        if (onSearch) onSearch(transcript);
      },
      (error) => {
        console.error(error);
        setIsListening(false);
        alert('Voice search error or not supported.');
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="bg-card-white p-4 rounded-2xl shadow-xl w-full max-w-md mx-auto relative border border-border-gray">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search electrician, plumber..."
            className="w-full pl-10 pr-4 py-4 rounded-xl border border-border-gray focus:outline-none focus:ring-2 focus:ring-blue-500 bg-bg-warm text-lg"
          />
        </div>
        <button 
          type="button" 
          onClick={handleVoiceSearch}
          className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-accent-orange text-white animate-pulse shadow-lg shadow-red-200' : 'bg-primary text-white hover:bg-primary-hover'}`}
        >
          <Mic size={24} />
        </button>
      </form>
      
      {isListening && (
        <div className="absolute -bottom-8 left-0 right-0 text-center text-sm font-medium text-accent-orange animate-pulse">
          Listening... (Boliye)
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;
