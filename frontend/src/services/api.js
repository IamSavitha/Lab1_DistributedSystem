import axios from 'axios';

const api = axios.create({
  baseURL: 'http://54.185.125.23:30344/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const ownerToken = localStorage.getItem('ownerToken');
    const travelerToken = localStorage.getItem('travelerToken');
    const token = ownerToken || travelerToken;
    
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
      console.error('Authentication error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;

