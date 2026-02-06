import axiosInstance from '../utils/axios';

/**
 * Service for order operations
 */
const orderService = {
  /**
   * Get customer's orders
   * @returns {Promise} Orders list
   */
  getOrders: async () => {
    try {
      const response = await axiosInstance.get('/customer/orders');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cancel an order
   * @param {number} orderId - Order ID to cancel
   * @returns {Promise} Response with success message
   */
  cancelOrder: async (orderId) => {
    try {
      const response = await axiosInstance.post(`/customer/order/cancel/${orderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Request return for an order
   * @param {number} orderId - Order ID to return
   * @returns {Promise} Response with success message
   */
  returnOrder: async (orderId) => {
    try {
      const response = await axiosInstance.post(`/customer/order/return/${orderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Submit product review
   * @param {Object} reviewData - Review data (orderId, productId, rating, comment)
   * @returns {Promise} Response with success message
   */
  submitReview: async (reviewData) => {
    try {
      const response = await axiosInstance.post('/customer/order/review', reviewData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default orderService;