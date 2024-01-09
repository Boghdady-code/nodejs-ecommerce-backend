const asyncHandler = require("express-async-handler");
const UserModel = require("../models/userModel");
const ApiError = require("../utils/apiError");

exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "Product added to wishlist",
    data: user.wishlist,
  });
});

exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.productId },
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: "success",
    message: "Product removed from wishlist",
    data: user.wishlist,
  });
});

exports.getLoggedInUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).populate("wishlist");
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: user.wishlist,
  });
});
