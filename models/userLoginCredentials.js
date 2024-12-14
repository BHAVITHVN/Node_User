const mongoose = require('mongoose');

const userLoginCredentialsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  password: { type: String, default: null },
  pin: { type: String, default: null },
  macId: { type: String },
  regLog: { type: String, default: null },
});


// Hash password before saving the user document
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Instance method to compare the provided password with the stored hash
userSchema.methods.isPasswordValid = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('UserLoginCredentials', userLoginCredentialsSchema);