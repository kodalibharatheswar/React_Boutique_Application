/**
 * Utility functions for formatting numbers and currency
 */

/**
 * Format number as Indian Rupee currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., "1,234.56")
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.00';
  }
  
  return Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Format number with Indian number system (commas)
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  
  return Number(num).toLocaleString('en-IN');
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} Discount percentage
 */
export const calculateDiscountPercent = (originalPrice, discountedPrice) => {
  if (!originalPrice || originalPrice <= 0) return 0;
  if (!discountedPrice || discountedPrice <= 0) return 0;
  if (discountedPrice >= originalPrice) return 0;
  
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * Format price with rupee symbol
 * @param {number} amount - The amount to format
 * @returns {string} Formatted price with ₹ symbol
 */
export const formatPrice = (amount) => {
  return `₹${formatCurrency(amount)}`;
};