const mongoose = require('mongoose');

const userBankDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bankName: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    ifsc: { type: String, required: true },
    accountNumber: { type: String, required: true },
    upiId:{type:String},
    qrCode:{type:String},
    timestamp: { type: Date, default: Date.now },

});

module.exports = mongoose.model('UserBankDetails', userBankDetailsSchema);