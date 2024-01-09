const CouponModel = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

// get Coupons
exports.getCoupons = asyncHandler(async (req, res) => {
  //
  const documentCounts = await CouponModel.countDocuments();
  const apiFeatures = new ApiFeatures(CouponModel.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .search()
    .paginate(documentCounts);
  // ------
  const paginationResult = apiFeatures.paginationResult;

  const coupons = await apiFeatures.mongoQuery;
  res.status(200).json({
    paginationResult,
    status: "success",
    results: coupons.length,
    data: coupons,
  });
});

// get specific coupon
exports.getSpecificCoupon = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const coupon = await CouponModel.findById(id);
  if (!coupon) {
    return next(new ApiError("Coupon not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: coupon,
  });
});

// create coupon
exports.createCoupon = asyncHandler(async (req, res) => {
  const newCoupon = new CouponModel(req.body);
  await newCoupon.save();
  res.status(201).json({
    status: "success",
    data: {
      coupon: newCoupon,
    },
  });
});

//update a specific coupon

exports.updateCoupon = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const coupon = await CouponModel.findByIdAndUpdate({ _id: id }, req.body, {
    new: true,
  });
  if (!coupon) {
    return next(new ApiError("Coupon not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: coupon,
  });
});

// delete coupon
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const coupon = await CouponModel.findByIdAndDelete(id);
  if (!coupon) {
    return next(new ApiError("Coupon not found", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
