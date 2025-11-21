import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage (traveler or owner)
    const travelerToken = localStorage.getItem('travelerToken');
    const ownerToken = localStorage.getItem('ownerToken');

    const token = travelerToken || ownerToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 403) {
      // Token expired or invalid
      const message = error.response.data.message;
      if (message && message.includes('token')) {
        // Clear tokens
        localStorage.removeItem('travelerToken');
        localStorage.removeItem('ownerToken');

        // Optionally redirect to login
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
