const UserModel = require("../models/userModel");
const { v4: uuidv4 } = require("uuid");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleWare");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Upload single image
exports.uploadUserImage = uploadSingleImage("profileImg");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.png`;
  if (req.file) {
    await sharp(req.file.buffer)
      .toFormat("png")
      .png({ quality: 100 })
      .toFile(`uploads/users/${filename}`);

    // Save image into our db
    req.body.profileImg = filename;
  }

  next();
});

// get users
exports.getUsers = asyncHandler(async (req, res) => {
  //
  const documentCounts = await UserModel.countDocuments();
  const apiFeatures = new ApiFeatures(UserModel.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .search()
    .paginate(documentCounts);
  // ------
  const paginationResult = apiFeatures.paginationResult;

  const users = await apiFeatures.mongoQuery;
  res.status(200).json({
    paginationResult,
    status: "success",
    results: users.length,
    data: users,
  });
});

// get specific user
exports.getSpecificUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const user = await UserModel.findById(id);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: user,
  });
});

// create user
exports.createUser = asyncHandler(async (req, res) => {
  const name = req.body.name;
  const newUser = new UserModel({
    name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    phone: req.body.phone,
    slug: slugify(name),
    profileImg: req.body.profileImg,
  });
  await newUser.save();

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

//update a specific user

exports.updateUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const name = req.body.name;
  const user = await UserModel.findByIdAndUpdate(
    { _id: id },

    req.body,

    { new: true }
  );
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.updateUserPassword = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const password = req.body.password;
  const user = await UserModel.findByIdAndUpdate(
    { _id: id },
    {
      password: await bcrypt.hash(password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: user,
  });
});

// delete user
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const user = await UserModel.findByIdAndDelete(id);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const password = req.body.password;
  const user = await UserModel.findByIdAndUpdate(
    id,
    {
      password: await bcrypt.hash(password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(200).json({
    status: "success",
    data: user,
    token,
  });
});

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const user = await UserModel.findByIdAndUpdate(
    id,
    {
      name,
      slug: slugify(name),
      email,
      phone,
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: user,
  });
});
