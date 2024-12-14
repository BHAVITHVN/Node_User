const UserBankDetails = require('../models/userBankDetails');

exports.addBankDetails = async (req, res) => {
  try {
    const bankDetails = new UserBankDetails(req.body);
    const savedDetails = await bankDetails.save();
    res.status(201).json(savedDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBankDetails = async (req, res) => {
  try {
    const userId = req.params.userId;
    const bankDetails = await UserBankDetails.find({ userId });
    if (bankDetails.length === 0)
      return res.status(404).json({ message: 'No bank details found' });

    res.json(bankDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBankDetails = async (req, res) => {
  try {
    const bankId = req.params.id;
    const deleted = await UserBankDetails.findByIdAndDelete(bankId);
    if (!deleted) return res.status(404).json({ message: 'Bank details not found' });

    res.json({ message: 'Bank details deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};