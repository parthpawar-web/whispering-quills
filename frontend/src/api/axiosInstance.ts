import axios from 'axios';

// Get base API URL from environment variables, fallback to port 5000 in development
const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT authorization token in request header
axiosInstance.interceptors.request.use(
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

// Format API errors cleanly before returning
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    console.error(`[API Error]: ${message}`, error);
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
