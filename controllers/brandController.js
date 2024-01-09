const BrandModel = require("../models/brandModel");
const { v4: uuidv4 } = require("uuid");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleWare");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

// Upload single image
exports.uploadBrandImage = uploadSingleImage("image");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.png`;

  await sharp(req.file.buffer)
    .toFormat("png")
    .png({ quality: 100 })
    .toFile(`uploads/brands/${filename}`);

  // Save image into our db
  req.body.image = filename;

  next();
});

// get Brands
exports.getBrands = asyncHandler(async (req, res) => {
  //
  const documentCounts = await BrandModel.countDocuments();
  const apiFeatures = new ApiFeatures(BrandModel.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .search()
    .paginate(documentCounts);
  // ------
  const paginationResult = apiFeatures.paginationResult;

  const brands = await apiFeatures.mongoQuery;
  res.status(200).json({
    paginationResult,
    status: "success",
    results: brands.length,
    data: brands,
  });
});

// get specific Brand
exports.getSpecificBrand = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const brand = await BrandModel.findById(id);
  if (!brand) {
    return next(new ApiError("Brand not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: brand,
  });
});

// create Brand
exports.createBrand = asyncHandler(async (req, res) => {
  const name = req.body.name;
  const newBrand = new BrandModel({
    name,
    slug: slugify(name),
    image: req.body.image,
  });
  await newBrand.save();
  res.status(201).json({
    status: "success",
    data: {
      brand: newBrand,
    },
  });
});

//update a specific brand

exports.updateBrand = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const name = req.body.name;
  const brand = await BrandModel.findOneAndUpdate(
    { _id: id },
    { name: name, slug: slugify(name), image: req.body.image },
    { new: true }
  );
  if (!brand) {
    return next(new ApiError("Brand not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: brand,
  });
});

// delete brand
exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const brand = await BrandModel.findByIdAndDelete(id);
  if (!brand) {
    return next(new ApiError("Brand not found", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
