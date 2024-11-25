import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This is important for sending cookies with requests
});

// Request interceptor
api.interceptors.request.use((config) => {
  // You don't need to manually set the token in the header
  // as the browser will automatically send the httpOnly cookie
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      // Redirect to login page if unauthorized
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;