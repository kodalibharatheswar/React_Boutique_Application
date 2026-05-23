import axiosInstance from '../utils/axios';

/**
 * Service for gift card operations
 */
const giftCardService = {
  /**
   * Get all gift cards for the customer
   * @returns {Promise} List of gift cards with balances
   */
  getGiftCards: async () => {
    try {
      const response = await axiosInstance.get('/customer/gift-cards');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Redeem a gift card
   * @param {string} cardNumber - Gift card number to redeem
   * @returns {Promise} Response with card details
   */
  redeemGiftCard: async (cardNumber) => {
    try {
      const response = await axiosInstance.post('/customer/gift-cards/redeem', {
        cardNumber: cardNumber
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Apply gift card balance to cart/checkout
   * @param {string} cardNumber - Gift card number to apply
   * @param {number} amount - Amount to apply from the card
   * @returns {Promise} Response with applied amount
   */
  applyGiftCard: async (cardNumber, amount) => {
    try {
      const response = await axiosInstance.post('/customer/gift-cards/apply', {
        cardNumber: cardNumber,
        amount: amount
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get total available balance across all gift cards
   * @returns {Promise} Response with total balance
   */
  getTotalBalance: async () => {
    try {
      const response = await axiosInstance.get('/customer/gift-cards/balance');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check gift card balance
   * @param {string} cardNumber - Gift card number to check
   * @returns {Promise} Response with card balance
   */
  checkBalance: async (cardNumber) => {
    try {
      const response = await axiosInstance.post('/customer/gift-cards/check-balance', {
        cardNumber: cardNumber
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default giftCardService;