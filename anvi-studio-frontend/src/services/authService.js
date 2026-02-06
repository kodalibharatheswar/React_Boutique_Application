import axiosInstance from '../utils/axios';

const authService = {
  // Register new user
  register: async (registrationData) => {
    try {
      const response = await axiosInstance.post('/auth/register', registrationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Confirm OTP for registration
  confirmOTP: async (email, otp) => {
    try {
      const response = await axiosInstance.post('/auth/confirm-otp', { email, otp });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'OTP confirmation failed' };
    }
  },

  // Login
  login: async (username, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { username, password });
      
      if (response.data.success && response.data.user) {
        // Store user data in localStorage if needed
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Logout
  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      // Clear local storage even if API call fails
      localStorage.removeItem('user');
      throw error.response?.data || { message: 'Logout failed' };
    }
  },

  // Forgot password - Step 1: Request OTP
  forgotPassword: async (identifier) => {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { identifier });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send OTP' };
    }
  },

  // Forgot password - Step 2: Verify OTP
  verifyResetOTP: async (email, otp) => {
    try {
      const response = await axiosInstance.post('/auth/reset-otp', { email, otp });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'OTP verification failed' };
    }
  },

  // Forgot password - Step 3: Reset password
  resetPassword: async (email, newPassword, confirmPassword) => {
    try {
      const response = await axiosInstance.post('/auth/reset-password', {
        email,
        newPassword,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password reset failed' };
    }
  },

  // Check authentication status
  checkAuth: async () => {
    try {
      const response = await axiosInstance.get('/auth/check');
      return response.data;
    } catch (error) {
      return { authenticated: false };
    }
  },

  // Resend OTP
  resendOTP: async (email, type = 'REGISTRATION') => {
    try {
      const response = await axiosInstance.post('/auth/resend-otp', { email, type });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to resend OTP' };
    }
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },

  // Check if user is authenticated (client-side check)
  isAuthenticated: () => {
    return !!localStorage.getItem('user');
  }
};

export default authService;