const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  couponCode: {
    type: String,
    required: true,
  },
  discountAmount: {
    type: Number,
  },

  activationDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  criteriaAmount: {
    type: Number,
    required: true,
  },
  usedUsers: {
    type: Array,
    ref: "User",
    default: [],
  },
  usersLimit: {
    type: Number,
    required: true,
  },
  isBlock: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Coupon', couponSchema);