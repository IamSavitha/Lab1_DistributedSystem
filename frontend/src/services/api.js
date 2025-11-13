import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const travelerToken = localStorage.getItem('travelerToken');
    const ownerToken = localStorage.getItem('ownerToken');
    
    // Add token to headers if it exists
    if (travelerToken) {
      config.headers.Authorization = `Bearer ${travelerToken}`;
    } else if (ownerToken) {
      config.headers.Authorization = `Bearer ${ownerToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Clear tokens
      localStorage.removeItem('travelerToken');
      localStorage.removeItem('ownerToken');
      
      // Redirect to login
      window.location.href = '/';
    }
    
    // Handle 403 Forbidden
    if (error.response && error.response.status === 403) {
      console.error('Access forbidden');
    }
    
    // Handle 500 Server Error
    if (error.response && error.response.status === 500) {
      console.error('Server error');
    }
    
    return Promise.reject(error);
  }
);

export default api;
