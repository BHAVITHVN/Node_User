const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  altPhone: { type: String, required: true },
  houseNameOrNumber: { type: String, required: true },
  location: { type: String, required: true },
  landmark: { type: String , required: true },
  village: { type: String, required: true },
  road: { type: String , required: true },
  pincode: { type: Number, required: true, enum: [123456, 654321, 112233] },
});

module.exports = mongoose.model('UserDetails', userDetailsSchema);