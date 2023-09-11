const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  amount: {
    type: Number,
    trim: true,
    required: true
  },
  term: {
    type: Number,
    trim: true,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  repayments: [
    {
      date: Date,
      amount: Number,
      paymentStatus: {
        type: String,
        default: 'PENDING'
      }
    }
  ],
  status: {
    type: String,
    default: 'PENDING'
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });


module.exports = mongoose.model('loan', loanSchema);