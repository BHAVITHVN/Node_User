const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: (email) =>
        !email || ['gmail.com', 'hotmail.com', 'yahoo.com'].some((domain) => email.endsWith(`@${domain}`)),
      message: 'Invalid email provider',
    },
  },
  nfcCardId: { type: String, default: null },
  role: { type: String, required: true },
  customer_status: { type: Number, default: 1 },
  permissions: { type: Number, default: 777 },
});

userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });
userSchema.index({ parent_id: 1 });
userSchema.index({ nfcCardId: 1 });


// Centralized static method to fetch user
userSchema.statics.findUser = async function (criteria) {
  return await this.findOne({
    $or: [{ nfcCardId: criteria.nfcCardId }, { mobile: criteria.mobile }],
  }).lean(); // Use lean for faster read queries
};

const User = mongoose.model('User', userSchema);


module.exports = User;