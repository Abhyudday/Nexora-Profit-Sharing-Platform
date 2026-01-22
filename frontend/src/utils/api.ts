import axios from 'axios';

// Production API URL - hardcoded for Railway deployment
const PRODUCTION_API_URL = 'https://backend-production-62aa.up.railway.app/api';

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? PRODUCTION_API_URL : 'http://localhost:5000/api');

// Debug: Log the API URL being used
console.log('🔗 API URL:', API_URL);
console.log('📊 Mode:', import.meta.env.MODE);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
