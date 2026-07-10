import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isWakingUp = error.code === 'ECONNABORTED' || !error.response || [502, 503, 504].includes(error.response?.status);
    
    if (isWakingUp) {
      error.isWakingUp = true;
      toast.error('Server is waking up. Please wait 30 seconds and try again.', { id: 'waking-up-toast' });
    } else if (error.response.status === 401) {
      localStorage.removeItem('token');
      // If we are not on login page, redirect and notify
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    } else if (error.response.status === 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

export default api;
