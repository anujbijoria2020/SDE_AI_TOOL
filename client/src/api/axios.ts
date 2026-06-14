import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'http://localhost:8000');

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor: on 401, call POST /api/auth/refresh, retry original request, on failure redirect to /auth
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes('/api/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        // Call POST /api/auth/refresh relative to baseURL or absolute
        await axios.post(`${baseURL}/api/auth/refresh`, {}, { withCredentials: true });
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // On failure, redirect to /auth ONLY if we are not already on /auth
        if (!window.location.pathname.includes('/auth')) {
          window.location.href = '/auth';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
