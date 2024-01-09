const SubCategoryModel = require("../models/subCategoryModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const ApiError = require("../utils/apiError");

//middleware to set category id to body for childroute
exports.setCategoryidToBody = async (req, res, next) => {
  if (!req.body.category) {
    req.body.category = req.params.categoryId;
  }
  next();
};

//create sub category
exports.createSubCategory = asyncHandler(async (req, res) => {
  const name = req.body.name;
  const category = req.body.category;
  const newSubCategory = new SubCategoryModel({
    name,
    slug: slugify(name),
    category,
  });
  await newSubCategory.save();
  res.status(201).json({
    status: "success",
    data: {
      subCategory: newSubCategory,
    },
  });
});

// get specific SubCategory
exports.getSpecificSubCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const subCategory = await SubCategoryModel.findById(id).populate({
    path: "category",
    select: "name -_id",
  });
  if (!subCategory) {
    return next(new ApiError("SubCategory not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: subCategory,
  });
});

// get all sub categories
exports.getSubCategories = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  // ..

  //to get all sub categories by categoryId
  let filterObject = {};
  if (req.params.categoryId) {
    filterObject = { category: req.params.categoryId };
  }
  const subCategories = await SubCategoryModel.find(filterObject)
    .skip(skip)
    .limit(limit)
    .populate({ path: "category", select: "name -_id" });
  res.status(200).json({
    status: "success",
    results: subCategories.length,
    page,
    data: subCategories,
  });
});

exports.updateSubCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const name = req.body.name;
  const category = req.body.category;
  const subCategory = await SubCategoryModel.findByIdAndUpdate(
    { _id: id },
    { name: name, slug: slugify(name), category },
    { new: true }
  );
  if (!subCategory) {
    return next(new ApiError("SubCategory not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: subCategory,
  });
});

// delete category
exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const subCategory = await SubCategoryModel.findByIdAndDelete(id);
  if (!subCategory) {
    return next(new ApiError("SubCategory not found", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
