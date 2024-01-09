const ProductModel = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleWare");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // console.log(req.files);
  //1- Image processing for imageCover
  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverFileName}`);

    // Save image into our db
    req.body.imageCover = imageCoverFileName;
  }
  //2- Image processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);

        // Save image into our db
        req.body.images.push(imageName);
      })
    );
  }
  next();
});

// get products
exports.getProducts = asyncHandler(async (req, res) => {
  // query method
  const documentCounts = await ProductModel.countDocuments();
  const apiFeatures = new ApiFeatures(ProductModel.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .search("Products")
    .paginate(documentCounts);
  const paginationResult = apiFeatures.paginationResult;
  const products = await apiFeatures.mongoQuery;
  res.status(200).json({
    paginationResult,
    status: "success",
    results: products.length,
    data: products,
  });
});

// get specific product
exports.getSpecificProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  let query = ProductModel.findById(id);
  if ("reviews") {
    query = query.populate("reviews");
  }
  const product = await query;

  if (!product) {
    return next(new ApiError("Product not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: product,
  });
});

// create product
exports.createProduct = asyncHandler(async (req, res) => {
  req.body.slug = slugify(req.body.title);

  const newProduct = new ProductModel(req.body);
  await newProduct.save();
  res.status(201).json({
    status: "success",
    data: {
      product: newProduct,
    },
  });
});

//update a specific product
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (req.body.title) {
    req.body.slug = slugify(req.body.title);
  }
  const product = await ProductModel.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  });
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: product,
  });
});

// delete product
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const product = await ProductModel.findByIdAndDelete(id);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
