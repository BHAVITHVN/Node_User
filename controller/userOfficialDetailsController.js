const UserOfficialDetails = require('../models/userOfficialDetails');

exports.addOfficialDetails = async (req, res) => {
  try {
    const officialDetails = new UserOfficialDetails(req.body);
    const savedDetails = await officialDetails.save();
    res.status(201).json(savedDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOfficialDetails = async (req, res) => {
  try {
    const userId = req.params.userId;
    const officialDetails = await UserOfficialDetails.find({ userId });
    if (officialDetails.length === 0)
      return res.status(404).json({ message: 'No official details found' });

    res.json(officialDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};