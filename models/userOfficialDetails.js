const mongoose = require('mongoose');

const userOfficialDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  officeName: { type: String, required: true },
  designation: { type: String, required: true },
  officialContact: { type: String, required: true },
  emailOfficial: {
    type: String,
    validate: {
      validator: (email) =>
        !email || ['gmail.com', 'hotmail.com', 'yahoo.com'].some((domain) => email.endsWith(`@${domain}`)),
      message: 'Invalid email provider',
    },
  },
  address: { type: [String], required: true },
  pincode: { type: Number, required: true, enum: [123456, 654321, 112233] },
});

module.exports = mongoose.model('UserOfficialDetails', userOfficialDetailsSchema);