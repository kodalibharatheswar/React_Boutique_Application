import axiosInstance from '../utils/axios';

/**
 * Service for wishlist operations
 */
const wishlistService = {
  /**
   * Get wishlist items for authenticated user
   * @returns {Promise} Wishlist data with items
   */
  getWishlist: async () => {
    try {
      const response = await axiosInstance.get('/wishlist');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add product to wishlist
   * @param {number} productId - Product ID to add
   * @returns {Promise} Response with success message
   */
  addToWishlist: async (productId) => {
    try {
      const response = await axiosInstance.post(`/wishlist/add/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove product from wishlist
   * @param {number} productId - Product ID to remove
   * @returns {Promise} Response with success message
   */
  removeFromWishlist: async (productId) => {
    try {
      const response = await axiosInstance.delete(`/wishlist/remove/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default wishlistService;