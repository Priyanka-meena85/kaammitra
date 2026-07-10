import api from '../utils/api';

export const createPaymentOrder = async (bookingId, paymentType, amount) => {
    const res = await api.post('/payments/create-order', { bookingId, paymentType, amount });
    return res.data;
};

export const verifyPayment = async (payload) => {
    const res = await api.post('/payments/verify', payload);
    return res.data;
};

export const getBookingPayments = async (bookingId) => {
    const res = await api.get(`/payments/booking/${bookingId}`);
    return res.data;
};

export const getMyPayments = async () => {
    const res = await api.get('/payments/my');
    return res.data;
};

export const getWorkerWallet = async () => {
    const res = await api.get('/payments/wallet');
    return res.data;
};

export const requestPayout = async (payload) => {
    const res = await api.post('/payments/payout-request', payload);
    return res.data;
};

export const getAdminPayouts = async () => {
    const res = await api.get('/payments/admin/payouts');
    return res.data;
};

export const updatePayoutStatus = async (id, payload) => {
    const res = await api.patch(`/payments/admin/payouts/${id}`, payload);
    return res.data;
};
