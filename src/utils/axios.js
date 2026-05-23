import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session-based auth
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Tokens are now in HttpOnly cookies - no need to manually add Authorization header 
    // for standard requests if using the same domain.
    // However, if the server expects a Bearer header, we still check localStorage for 
    // backward compatibility or external API calls.
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for auth endpoints to prevent loops
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

    // If 401 error, not already retrying, and NOT an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const res = await axiosInstance.post('/auth/refresh-token');
        
        if (res.data.success) {
          // If refresh was successful, the new accessToken is in the cookie
          // If we are using localStorage for the token, update it
          if (res.data.accessToken) {
            localStorage.setItem('authToken', res.data.accessToken);
          }
          
          // Retry original request
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;