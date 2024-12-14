const User = require('../models/user');
const redisClient = require('../config/redisConfig');
const {generateAccessToken} = require('../utils/jwtUtils');

const { fetchUser } = require('../service/userService');

exports.createUser = async (req, res) => {

  try {
    const existingUser = await fetchUser({ mobile });
    if (existingUser) {
      return res.status(200).json({
        message: 'User already exists. Please log in.',
        user: {
          name: existingUser.name,
          email: existingUser.email,
          mobile: existingUser.mobile,
        },
      });
    }
    const user = new User(req.body);
    const savedUser = await user.save();
    redisClient.del('users');

    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUser = async (req, res) => {
  const userId = req.params.id;
  redisClient.get(`user:${userId}`, async (err, data) => {
    if (data) {
      return res.json(JSON.parse(data));
    }

    try {
      const user = await User.findById(userId).populate('parent_id');
      if (!user) return res.status(404).json({ message: 'User not found' });

      redisClient.setex(`user:${userId}`, 3600, JSON.stringify(user));
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    redisClient.del(`user:${req.params.id}`);
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Soft Delete User
 *
 * This function performs a soft delete operation for a user by updating the `customer_status` field to 0.
 * A soft delete means the user is marked as inactive instead of being permanently removed from the database.
 *
 * Workflow:
 * 1. Find the user by ID and update their `customer_status` to 0 using `findByIdAndUpdate`.
 * 2. If the user is not found, return a 404 response with an appropriate error message.
 * 3. Clear the cached user data in Redis using `redisClient.del`.
 * 4. Return a success response including the updated user data.
 *
 * Parameters:
 * - req.params.id (String): The user ID passed as a route parameter.
 *
 * Responses:
 * - 200 OK: Returns a message confirming soft deletion and the updated user data.
 * - 404 Not Found: Returns an error if the user does not exist.
 * - 500 Internal Server Error: Handles unexpected errors.
 */


exports.deleteUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { customer_status: 0 },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    redisClient.del(`user:${req.params.id}`);
    res.json({ message: 'User soft-deleted successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};






exports.login = async (req, res) => {
  const { phone, password } = req.body;

  try {
    // Validate input
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required.' });
    }

    // Fetch user using phone
    const user = await fetchUser({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register.' });
    }

    // If password is not provided, prompt the client
    if (!password) {
      return res.status(400).json({ message: 'User exists. Please provide your password to continue.' });
    }

    // Check account status
    if (user.customer_status === 0) {
      return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
    }

    // Validate password
    if (!(await user.isPasswordValid(password))) {
      return res.status(401).json({ message: 'Invalid password. Please try again.' });
    }

    // Generate and return token with user details
    const token = generateAccessToken(user._id);
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone, 
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
};
