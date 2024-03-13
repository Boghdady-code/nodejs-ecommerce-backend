const ReviewModel = require("../models/reviewModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

// get Reviews
exports.getReviews = asyncHandler(async (req, res, next) => {
  //
  const documentCounts = await ReviewModel.countDocuments();
  let filterOptions = {};
  filterOptions = {
    product: req.params.productId,
  };
  const apiFeatures = new ApiFeatures(
    ReviewModel.find(filterOptions),
    req.query
  );
  const paginationResult = apiFeatures.paginationResult;
  const reviews = await apiFeatures.mongoQuery;
  if (reviews.length == 0) {
    return next(new ApiError("No reviews found", 404));
  }
  res.status(200).json({
    paginationResult,
    status: "success",
    results: reviews.length,
    data: reviews,
  });
});

// get specific Review
exports.getSpecificReview = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const review = await ReviewModel.findById(id);
  if (!review) {
    return next(new ApiError("Review not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: review,
  });
});
exports.setProductIdAndUserIdToBody = async (req, res, next) => {
  if (!req.body.product) {
    req.body.product = req.params.productId;
  }
  req.body.user = req.user._id;
  next();
};

// create Review
exports.createReview = asyncHandler(async (req, res) => {
  const newReview = new ReviewModel(req.body);
  await newReview.save();
  res.status(201).json({
    status: "success",
    data: {
      review: newReview,
    },
  });
});

//update a specific Review

exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await ReviewModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!review) {
    return next(new ApiError("Review not found", 404));
  }
  review.save();
  res.status(200).json({
    status: "success",
    data: review,
  });
});

// delete Review
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const review = await ReviewModel.findByIdAndDelete(id);
  if (!review) {
    return next(new ApiError("Review not found", 404));
  }
  await review.deleteOne();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
