/**
 * Safe localStorage wrapper with error handling
 * Handles quota exceeded errors and other localStorage failures gracefully
 */

export const safeLocalStorage = {
  /**
   * Safely get an item from localStorage
   * @param {string} key - The key to retrieve
   * @param {*} defaultValue - Default value if retrieval fails
   * @returns {*} The parsed value or defaultValue
   */
  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage (key: ${key}):`, error.message);
      return defaultValue;
    }
  },

  /**
   * Safely set an item in localStorage
   * @param {string} key - The key to set
   * @param {*} value - The value to store (will be JSON stringified)
   * @returns {boolean} True if successful, false otherwise
   */
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded. Consider clearing old data.');
        // Optionally: try to clear some old data and retry
        return false;
      }
      console.error(`Error writing to localStorage (key: ${key}):`, error.message);
      return false;
    }
  },

  /**
   * Safely remove an item from localStorage
   * @param {string} key - The key to remove
   * @returns {boolean} True if successful, false otherwise
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (key: ${key}):`, error.message);
      return false;
    }
  },

  /**
   * Safely clear all localStorage
   * @returns {boolean} True if successful, false otherwise
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error.message);
      return false;
    }
  }
};
