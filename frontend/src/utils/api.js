import axios from 'axios';
import toast from 'react-hot-toast';

let API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

// Force the correct Render URL with /api/v1 if the env var is missing, malformed, or just the base domain
if (!API_URL || API_URL === "https://kaammitra-1.onrender.com" || API_URL.includes("ENABLE_DEMO")) {
  API_URL = "https://kaammitra-1.onrender.com/api/v1";
}

const api = axios.create({
  baseURL: API_URL,
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
      // Dispatch event instead of hard redirect
      window.dispatchEvent(new Event('auth:unauthorized'));
    } else if (error.response.status === 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

export default api;
