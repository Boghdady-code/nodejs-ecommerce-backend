const CategoryModel = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const ApiError = require("../utils/apiError");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleWare");

// Upload single image
exports.uploadCategoryImage = uploadSingleImage("image");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/categories/${filename}`);

    // Save image into our db
    req.body.image = filename;
  }

  next();
});

// get categories
exports.getCategories = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  // ..
  const categories = await CategoryModel.find({}).skip(skip).limit(limit);
  res.status(200).json({
    status: "success",
    results: categories.length,
    page,
    data: categories,
  });
});

// get specific category
exports.getSpecificCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const category = await CategoryModel.findById(id);
  if (!category) {
    return next(new ApiError("Category not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: category,
  });
});

// create category
exports.createCategory = asyncHandler(async (req, res) => {
  const name = req.body.name;
  const newCategory = new CategoryModel({
    name,
    slug: slugify(name),
    image: req.body.image,
  });
  await newCategory.save();
  res.status(201).json({
    status: "success",
    data: {
      category: newCategory,
    },
  });
});

//update a specific category

exports.updateCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const name = req.body.name;
  const category = await CategoryModel.findOneAndUpdate(
    { _id: id },
    { name: name, slug: slugify(name), image: req.body.image },
    { new: true }
  );
  if (!category) {
    return next(new ApiError("Category not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: category,
  });
});

// delete category
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const category = await CategoryModel.findByIdAndDelete(id);
  if (!category) {
    return next(new ApiError("Category not found", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
