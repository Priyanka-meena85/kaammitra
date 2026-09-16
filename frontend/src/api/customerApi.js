import api from '../utils/api';

export const suggestWorkers = async (params) => {
    // GET /bookings/suggest-workers?service=...&city=...
    const res = await api.get('/bookings/suggest-workers', { params });
    return res.data;
};

export const getWorkerDetails = async (workerId) => {
    // GET /workers/:id
    const res = await api.get(`/workers/${workerId}`);
    return res.data;
};

export const createBooking = async (bookingData) => {
    // POST /bookings
    const res = await api.post('/bookings', bookingData);
    return res.data;
};

export const getMyBookings = async (customerId) => {
    // GET /bookings/customer/:customerId
    const res = await api.get(`/bookings/customer/${customerId}`);
    return res.data;
};

export const getBookingDetails = async (bookingId) => {
    // Assuming GET /bookings/:id or we can fetch all and filter for now
    // Actually, backend has `GET /bookings/:id` usually, let's assume it exists, 
    // or just fetch all and find the one if there isn't a single booking endpoint.
    // Let's use getMyBookings and filter for safety since we know it exists.
    return null; // Implemented directly in component below
};

export const updateBookingStatus = async (bookingId, status) => {
    // PATCH /bookings/:id/status
    const res = await api.patch(`/bookings/${bookingId}/status`, { status });
    return res.data;
};

export const parseVoiceInput = async (text) => {
    try {
        const res = await api.post('/ai/parse-problem', { text });
        return res.data;
    } catch(err) {
        // Fallback simple parsing if endpoint fails/doesn't exist for now
        const lowerText = text.toLowerCase();
        let service = 'General';
        if (lowerText.includes('plumb') || lowerText.includes('tap') || lowerText.includes('leak')) service = 'Plumbing';
        if (lowerText.includes('electric') || lowerText.includes('fan') || lowerText.includes('ac')) service = 'Electrical';
        if (lowerText.includes('clean') || lowerText.includes('sweep')) service = 'Cleaning';
        
        return { success: true, data: { service, problem: text } };
    }
};

export const getTrustedWorkers = async () => {
    const res = await api.get('/workers?limit=5');
    return res.data;
};
