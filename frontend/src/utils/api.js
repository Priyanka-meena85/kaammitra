import axios from 'axios';
import toast from 'react-hot-toast';

let API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

// A bare domain or a mangled .env value still needs the API path appended.
if (API_URL && !API_URL.includes("/api/")) {
  API_URL = `${API_URL.split("VITE_")[0].replace(/\/+$/, "")}/api/v1`;
}

// Never silently fall back to production: a developer running the app without a
// .env would otherwise read and write live customer data. Default to localhost
// in dev, and fail loudly in a production build that was shipped misconfigured.
if (!API_URL) {
  if (import.meta.env.DEV) {
    API_URL = "http://localhost:5000/api/v1";
    console.warn("VITE_API_URL is not set — falling back to http://localhost:5000/api/v1");
  } else {
    console.error("VITE_API_URL is not set. API requests will fail until it is configured.");
    API_URL = "/api/v1";
  }
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
    } else if (error.response.status === 429) {
      toast.error(
        error.response.data?.message || 'Too many attempts. Please wait a little and try again.',
        { id: 'rate-limit-toast' }
      );
    } else if (error.response.status === 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

export default api;
