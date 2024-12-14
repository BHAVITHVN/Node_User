const UserLoginCredentials = require('../models/userLoginCredentials');
const bcrypt = require('bcrypt');

exports.addLoginCredentials = async (req, res) => {
  try {
    const { userId, password, pin, macId, regLog } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPin = await bcrypt.hash(pin, 10);

    const loginCredentials = new UserLoginCredentials({
      userId,
      password: hashedPassword,
      pin: hashedPin,
      macId,
      regLog,
    });

    const savedCredentials = await loginCredentials.save();
    res.status(201).json(savedCredentials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.validateLogin = async (req, res) => {
  try {
    const { userId, password } = req.body;

    const credentials = await UserLoginCredentials.findOne({ userId });
    if (!credentials) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, credentials.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};