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
    // Get token from localStorage (使用与Slice一致的key名称)
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

// Response interceptor - DON'T automatically clear tokens on 401
// Let the component handle logout explicitly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just log the error, don't clear tokens automatically
    if (error.response?.status === 401) {
      console.error('Authentication error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;
