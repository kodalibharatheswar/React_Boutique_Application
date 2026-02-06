import axiosInstance from '../utils/axios';

/**
 * Service for customer profile operations
 */
const customerService = {
  /**
   * Get customer profile
   * @returns {Promise} Customer profile data
   */
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/customer/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update customer profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Response with success message
   */
  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put('/customer/profile/update', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change password
   * @param {Object} passwordData - Current and new password data
   * @returns {Promise} Response with success message
   */
  changePassword: async (passwordData) => {
    try {
      const response = await axiosInstance.post('/customer/profile/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Initiate email change
   * @param {string} newEmail - New email address
   * @returns {Promise} Response with verification instructions
   */
  initiateEmailChange: async (newEmail) => {
    try {
      const response = await axiosInstance.post('/customer/profile/change-email/initiate', { newEmail });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Finalize email change with OTP
   * @param {string} newEmail - New email address
   * @param {string} otp - Verification code
   * @returns {Promise} Response with success message
   */
  finalizeEmailChange: async (newEmail, otp) => {
    try {
      const response = await axiosInstance.post('/customer/profile/change-email/finalize', {
        newEmail,
        otp
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update newsletter subscription preference
   * @param {boolean} optIn - Subscribe (true) or unsubscribe (false)
   * @returns {Promise} Response with success message
   */
  updateNewsletterSubscription: async (optIn) => {
    try {
      const response = await axiosInstance.put('/customer/profile/update-newsletter', { optIn });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default customerService;