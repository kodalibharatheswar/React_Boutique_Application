import axiosInstance from '../utils/axios';

/**
 * Service for coupon operations
 */
const couponService = {
  /**
   * Get all available coupons for the customer
   * @returns {Promise} List of coupons
   */
  getCoupons: async () => {
    try {
      const response = await axiosInstance.get('/customer/coupons');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Apply a coupon code to cart/checkout
   * @param {string} couponCode - Coupon code to apply
   * @returns {Promise} Response with discount details
   */
  applyCoupon: async (couponCode) => {
    try {
      const response = await axiosInstance.post('/customer/coupons/apply', {
        code: couponCode
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Validate a coupon code
   * @param {string} couponCode - Coupon code to validate
   * @param {number} orderAmount - Order amount to check against minimum
   * @returns {Promise} Response with validation result
   */
  validateCoupon: async (couponCode, orderAmount) => {
    try {
      const response = await axiosInstance.post('/customer/coupons/validate', {
        code: couponCode,
        orderAmount: orderAmount
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default couponService;