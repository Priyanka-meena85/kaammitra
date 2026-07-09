import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search } from 'lucide-react';
import WorkerCard from '../components/WorkerCard';
import { workers } from '../data/workers';
import { services } from '../data/services';

const Workers = () => {
  const [searchParams] = useSearchParams();
  const serviceQuery = searchParams.get('service') || '';
  
  const [searchTerm, setSearchTerm] = useState(serviceQuery);
  const [selectedService, setSelectedService] = useState(serviceQuery);
  const [filteredWorkers, setFilteredWorkers] = useState(workers);
  
  // Filters
  const [distanceFilter, setDistanceFilter] = useState('all'); // all, 5, 15
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    let result = workers;

    // Search and Service Filter
    const filterTerm = selectedService || searchTerm;
    if (filterTerm) {
      const lower = filterTerm.toLowerCase();
      result = result.filter(w => 
        w.service.toLowerCase().includes(lower) || 
        w.skills.some(s => s.toLowerCase().includes(lower))
      );
    }

    // Distance Filter
    if (distanceFilter !== 'all') {
      const maxDist = parseInt(distanceFilter);
      result = result.filter(w => w.distance <= maxDist);
    }

    // Verified
    if (verifiedOnly) result = result.filter(w => w.isVerified);
    
    // Available
    if (availableOnly) result = result.filter(w => w.isAvailable);

    // Sort by best (available, verified, rating)
    result.sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
      if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
      return b.rating - a.rating;
    });

    setFilteredWorkers(result);
  }, [searchTerm, selectedService, distanceFilter, verifiedOnly, availableOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">
          {selectedService ? `Workers for ${selectedService}` : 'Find Workers near you'}
        </h1>
        <p className="text-text-gray">Showing {filteredWorkers.length} workers based on your criteria.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-1/4">
          <div className="bg-card-white p-6 rounded-2xl shadow-sm border border-border-gray sticky top-24">
            <h2 className="text-lg font-bold text-navy flex items-center gap-2 mb-6">
              <Filter size={20} /> Filters
            </h2>
            
            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Search Service</label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSelectedService('');
                    }}
                    placeholder="e.g. Electrician"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Service Category */}
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Category</label>
                <select 
                  value={selectedService} 
                  onChange={(e) => {
                    setSelectedService(e.target.value);
                    setSearchTerm('');
                  }}
                  className="w-full p-2 rounded-lg border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Services</option>
                  {services.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.hindiName})</option>
                  ))}
                </select>
              </div>

              {/* Distance */}
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Distance Zone</label>
                <select 
                  value={distanceFilter} 
                  onChange={(e) => setDistanceFilter(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">Any Distance</option>
                  <option value="5">Green Zone (0-5 km)</option>
                  <option value="15">Yellow Zone (5-15 km)</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={verifiedOnly} 
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-text-gray">Verified Workers Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={availableOnly} 
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-text-gray">Available Now Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Worker List */}
        <div className="w-full lg:w-3/4">
          {filteredWorkers.length === 0 ? (
            <div className="bg-card-white p-10 rounded-2xl shadow-sm border border-border-gray text-center">
              <div className="inline-block bg-bg-soft-blue p-4 rounded-full mb-4">
                <Search size={32} className="text-border-gray" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">No workers found</h3>
              <p className="text-text-gray">Try adjusting your filters or search for something else.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedService('');
                  setDistanceFilter('all');
                  setVerifiedOnly(false);
                  setAvailableOnly(false);
                }}
                className="mt-6 text-primary font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredWorkers.map(worker => (
                <WorkerCard key={worker.id} worker={worker} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workers;
