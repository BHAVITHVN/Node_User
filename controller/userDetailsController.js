const UserDetails = require('../models/userDetails');
const redisClient = require('../config/redisConfig');

exports.createUserDetails = async (req, res) => {
  try {
    const userDetails = new UserDetails(req.body);
    const savedDetails = await userDetails.save();
    redisClient.del(`userDetails:${req.body.userId}`);
    res.status(201).json(savedDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserDetails = async (req, res) => {
  const userId = req.params.id;

  redisClient.get(`userDetails:${userId}`, async (err, data) => {
    if (data) {
      return res.json(JSON.parse(data));
    }

    try {
      const details = await UserDetails.findOne({ userId });
      if (!details) return res.status(404).json({ message: 'User details not found' });

      redisClient.setex(`userDetails:${userId}`, 3600, JSON.stringify(details));
      res.json(details);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

exports.updateUserDetails = async (req, res) => {
  try {
    const updates = req.body;
    const updatedDetails = await UserDetails.findOneAndUpdate(
      { userId: req.params.id },
      updates,
      { new: true }
    );

    if (!updatedDetails) return res.status(404).json({ message: 'User details not found' });

    redisClient.del(`userDetails:${req.params.id}`);
    res.json(updatedDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};