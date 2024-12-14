const User = require('../models/User');

/**
 * Fetch a user by given criteria
 * @param {Object} criteria - Criteria to search for the user (e.g., phone)
 * @returns {Object} User document or null
 */
const fetchUser = async (criteria) => {
  try {
    return await User.findOne(criteria);
  } catch (err) {
    throw new Error(`Error fetching user: ${err.message}`);
  }
};

module.exports = { fetchUser };

