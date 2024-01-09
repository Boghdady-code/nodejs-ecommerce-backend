const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const UserModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

exports.register = asyncHandler(async (req, res, next) => {
  const user = await UserModel.create({
    name: req.body.name,
    slug: slugify(req.body.name),
    email: req.body.email,
    password: req.body.password,
  });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    status: "success",
    data: {
      user,
      token,
    },
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("Invaild email or password"), 401);
  }
  const isPasswordCorrect = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!user || !isPasswordCorrect) {
    return next(new ApiError("Invaild email or password"), 401);
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(200).json({
    status: "success",
    data: {
      user,
      token,
    },
  });
});
// Protect Authentication
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ApiError("You are not logged in", 401));
  }
  // Invaild token, expired
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //check if the user exists
  const currentUser = await UserModel.findById(decoded.userId);
  if (!currentUser) {
    return next(new ApiError("User not found", 401));
  }

  // check if user changed password after the token was issued
  if (currentUser.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (changedTimeStamp > decoded.iat) {
      return next(
        new ApiError("User recently changed password, login again", 401)
      );
    }
  }

  req.user = currentUser;
  next();
});

exports.allowedTo = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not Authorized to perform this action", 403)
      );
    }
    next();
  });
};

exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  await user.save();
  const message = `Dear ${user.name},\nPlease use this code to reset your password. \nCode: ${resetCode}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Code (Valid for 10 min)",
      message: message,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(new ApiError("There was an error in sending email", 500));
  }

  res.status(200).json({
    status: "success",
    message: "Code sent to your email",
  });
});

exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await UserModel.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Invalid or Expired code", 400));
  }

  user.passwordResetVerified = true;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "Code verified",
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findOne({
    email: req.body.email,
  });

  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset Code not verified", 400));
  }

  user.password = req.body.newPassword;

  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
    token,
  });
});
