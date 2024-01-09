const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Coupon name is required"],
    unique: [true, "Coupon name must be unique"],
    trim: true,
  },
  expires: {
    type: Date,
    required: [true, "Coupon expires Date is required"],
  },
  discount: {
    type: Number,
    required: [true, "Coupon discount is required"],
  },
});

const CouponModel = mongoose.model("Coupon", couponSchema);

module.exports = CouponModel;
