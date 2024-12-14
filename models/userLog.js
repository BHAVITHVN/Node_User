const mongoose = require('mongoose');

const userLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  log: { type: String, required: true },
});

module.exports = mongoose.model('UserLog', userLogSchema);