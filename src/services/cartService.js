import axiosInstance from '../utils/axios';

/**
 * Service for shopping cart operations
 */
const cartService = {
  /**
   * Get cart items and total for authenticated user
   * @returns {Promise} Cart data with items and total
   */
  getCart: async () => {
    try {
      const response = await axiosInstance.get('/cart');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add product to cart
   * @param {number} productId - Product ID to add
   * @param {number} quantity - Quantity to add (default: 1)
   * @returns {Promise} Response with success message
   */
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await axiosInstance.post('/cart/add', {
        productId,
        quantity
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove item from cart
   * @param {number} itemId - Cart item ID to remove
   * @returns {Promise} Response with success message
   */
  removeFromCart: async (itemId) => {
    try {
      const response = await axiosInstance.delete(`/cart/remove/${itemId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update cart item quantity
   * @param {number} itemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Promise} Response with success message
   */
  updateQuantity: async (itemId, quantity) => {
    try {
      const response = await axiosInstance.put('/cart/update', {
        itemId,
        quantity
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default cartService;