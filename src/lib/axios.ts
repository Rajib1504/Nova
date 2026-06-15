import axios from 'axios';

// Create a custom axios instance
export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // You can add generic auth tokens or custom headers here if needed
    // Example: config.headers['Authorization'] = `Bearer ${token}`
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // Pass successful responses directly
    return response;
  },
  (error) => {
    // Centralized error handling
    if (error.response) {
      // Server responded with a status other than 200 range
      console.error(`[API Error] ${error.response.status}: ${error.response.data?.message || error.message}`);
    } else if (error.request) {
      // Request was made but no response received
      console.error(`[API Network Error] No response received`);
    } else {
      console.error(`[API Error] ${error.message}`);
    }
    return Promise.reject(error);
  }
);
