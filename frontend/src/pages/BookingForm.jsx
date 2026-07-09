import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { workers } from '../data/workers';

const BookingForm = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const worker = workers.find(w => w.id === workerId);

  const [formData, setFormData] = useState({
    problem: '',
    address: '',
    date: '',
    time: '',
    urgency: 'Normal',
    contact: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save to localStorage
    const newBooking = {
      id: `BKG-${Math.floor(Math.random() * 10000)}`,
      workerId: worker.id,
      workerName: worker.name,
      service: worker.service,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      ...formData
    };

    const existingBookings = JSON.parse(localStorage.getItem('kaammitra_bookings') || '[]');
    localStorage.setItem('kaammitra_bookings', JSON.stringify([newBooking, ...existingBookings]));

    alert('Booking submitted successfully!');
    navigate('/my-bookings');
  };

  if (!worker) return <div>Worker not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-card-white rounded-3xl shadow-sm border border-border-gray p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Book Service</h1>
          <p className="text-text-gray">You are booking <span className="font-bold text-primary">{worker.name}</span> for <span className="font-bold text-primary">{worker.service}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-gray mb-2">Describe the problem</label>
            <textarea
              name="problem"
              required
              rows="3"
              value={formData.problem}
              onChange={handleChange}
              placeholder="E.g., Fan is making noise, pipe is leaking..."
              className="w-full p-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-gray mb-2">Service Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Complete address (House no, Street, Landmark)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2">Preferred Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2">Preferred Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
                <input
                  type="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-gray mb-2">Contact Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-border-gray" size={20} />
              <input
                type="tel"
                name="contact"
                required
                value={formData.contact}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-gray focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-gray mb-2">Urgency</label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="urgency" 
                  value="Normal" 
                  checked={formData.urgency === 'Normal'} 
                  onChange={handleChange} 
                  className="peer hidden" 
                />
                <div className="border border-border-gray rounded-xl p-4 text-center peer-checked:bg-bg-soft-blue peer-checked:border-blue-500 peer-checked:text-primary-hover font-medium transition-all">
                  Normal
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="urgency" 
                  value="Urgent" 
                  checked={formData.urgency === 'Urgent'} 
                  onChange={handleChange} 
                  className="peer hidden" 
                />
                <div className="border border-border-gray rounded-xl p-4 text-center peer-checked:bg-accent-orange/10 peer-checked:border-red-500 peer-checked:text-accent-orange-hover font-medium transition-all">
                  Urgent (Need ASAP)
                </div>
              </label>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-primary-hover hover:shadow-xl transition-all flex justify-center items-center gap-2 mt-8"
          >
            <CheckCircle2 size={24} /> Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
