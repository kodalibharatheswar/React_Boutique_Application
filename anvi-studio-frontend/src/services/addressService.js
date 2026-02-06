import axiosInstance from '../utils/axios';

/**
 * Service for address management operations
 */
const addressService = {
  /**
   * Get all addresses for the customer
   * @returns {Promise} List of addresses
   */
  getAddresses: async () => {
    try {
      const response = await axiosInstance.get('/customer/addresses');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add or update an address
   * @param {Object} addressData - Address data to save
   * @returns {Promise} Response with success message
   */
  saveAddress: async (addressData) => {
    try {
      const response = await axiosInstance.post('/customer/addresses/add', addressData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete an address
   * @param {number} addressId - Address ID to delete
   * @returns {Promise} Response with success message
   */
  deleteAddress: async (addressId) => {
    try {
      const response = await axiosInstance.delete(`/customer/addresses/delete/${addressId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Set an address as default
   * @param {number} addressId - Address ID to set as default
   * @returns {Promise} Response with success message
   */
  setDefaultAddress: async (addressId) => {
    try {
      const response = await axiosInstance.post(`/customer/addresses/set-default/${addressId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default addressService;