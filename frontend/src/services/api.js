import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5075/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wayspot_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Disable forced redirect for UI testing with mock data
    /*
    if (error.response?.status === 401) {
      localStorage.removeItem('wayspot_token');
      localStorage.removeItem('wayspot_user');
      window.location.href = '/login';
    }
    */
    return Promise.reject(error);
  }
);

export default api;

