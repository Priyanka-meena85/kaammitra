import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Mic, ArrowLeft, Clock, TrendingUp } from 'lucide-react';

const CustomerSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate('/customer/search/results', { state: { text: query, type: 'text' } });
    }
  };

  const handleQuickSearch = (term) => {
    navigate('/customer/search/results', { state: { text: term, type: 'text' } });
  };
  
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header & Input */}
        <div className="sticky top-0 bg-white z-10 px-4 pt-6 pb-4 border-b border-slate-100 shadow-sm md:pt-8 md:border-none">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/customer')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 md:hidden">
              <ArrowLeft size={24} />
            </button>
            <form onSubmit={handleSearch} className="flex-grow flex items-center bg-slate-100 rounded-full px-4 py-3 md:py-4 md:text-lg">
              <Search size={24} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="What problem can we solve?" 
                className="bg-transparent border-none focus:ring-0 w-full ml-3 text-slate-800 placeholder-slate-400 outline-none"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>
            <button onClick={() => navigate('/customer/search/voice')} className="w-12 h-12 md:w-14 md:h-14 bg-orange-50 hover:bg-orange-100 transition rounded-full flex items-center justify-center text-orange-500 shrink-0">
              <Mic size={24} />
            </button>
          </div>
        </div>

        <div className="p-4 md:px-0 mt-4">
          {/* Popular Searches */}
          <div className="mb-10">
            <h3 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-orange-500" />
              Popular searches
            </h3>
            <div className="flex flex-wrap gap-3">
              {['Fan not working', 'Tap leaking', 'AC not cooling', 'Need house cleaning'].map((term) => (
                <span 
                  key={term} 
                  onClick={() => handleQuickSearch(term)}
                  className="bg-slate-50 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-full text-sm md:text-base font-medium cursor-pointer hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-colors shadow-sm"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Clock size={18} className="text-slate-400" />
              Recent searches
            </h3>
            <div className="flex flex-col gap-2">
              {['Sofa dry cleaning', 'Fix switchboard'].map((term) => (
                <div 
                  key={term} 
                  onClick={() => handleQuickSearch(term)}
                  className="flex items-center justify-between py-4 px-4 bg-white border border-slate-100 rounded-2xl cursor-pointer group hover:shadow-md hover:border-orange-100 transition-all"
                >
                  <span className="text-slate-600 md:text-lg font-medium group-hover:text-orange-500 transition-colors">{term}</span>
                  <Search size={18} className="text-slate-300 group-hover:text-orange-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSearch;
