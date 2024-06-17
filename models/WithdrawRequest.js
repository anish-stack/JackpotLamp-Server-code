const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const withdrawalRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['UPI', 'Bank', 'NEFT']
  },
  upiId: {
    type: String,
    required: function() {
      return this.paymentMethod === 'UPI';
    }
  },
  accountNumber: {
    type: String,
    required: function() {
      return this.paymentMethod === 'Bank' || this.paymentMethod === 'NEFT';
    },
    match: /^[0-9]+$/
  },
  bankName: {
    type: String,
    required: function() {
      return this.paymentMethod === 'Bank';
    }
  },
  ifscCode: {
    type: String,
    required: function() {
      return this.paymentMethod === 'Bank';
    }
  },
  receiverName: {
    type: String,
    required: function() {
      return this.paymentMethod === 'Bank';
    }
  },
  mobileNumber: {
    type: String,
    required: function() {
      return this.paymentMethod === 'NEFT';
    },
    match: /^[0-9]+$/
  },
  comments: [commentSchema],
  status: {
    type: String,
    enum: ['Pending', 'Canceled', 'Completed'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  releasedAt: {
    type: Date
  },
  paymentType: {
    type: String,
    enum: ['UPI', 'Bank Transfer', 'Other'],
    default: null
  },
  transactionId: {
    type: String,
    default: null
  },
  cancelReason: {
    type: String,
    default: null
  },
  deleteReason: {
    type: String,
    default: null
  }
});

const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

module.exports = WithdrawalRequest;
