import axios from 'axios';
import loadingState from './loadingState';

const rawUrl = import.meta.env.VITE_API_URL || '/api';
// Ensure absolute URLs always have a scheme (guards against missing https://)
const baseURL =
  rawUrl.startsWith('http') || rawUrl.startsWith('/')
    ? rawUrl
    : `https://${rawUrl}`;

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

// Attach JWT from localStorage on every request
api.interceptors.request.use(
  (config) => {
    loadingState.increment();
    const token = localStorage.getItem('pv_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    loadingState.decrement();
    return Promise.reject(error);
  }
);

// Handle token expiry globally
api.interceptors.response.use(
  (response) => {
    loadingState.decrement();
    return response;
  },
  (error) => {
    loadingState.decrement();
    if (error.response?.status === 401) {
      localStorage.removeItem('pv_token');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
