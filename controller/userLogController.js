const UserLog = require('../models/userLog');

exports.addLog = async (req, res) => {
  try {
    const log = new UserLog(req.body);
    const savedLog = await log.save();
    res.status(201).json(savedLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLogsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const logs = await UserLog.find({ userId });
    if (logs.length === 0) return res.status(404).json({ message: 'No logs found' });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};