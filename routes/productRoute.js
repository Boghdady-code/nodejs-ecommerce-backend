const express = require("express");

const router = express.Router();
const authController = require("../controllers/authController");

const {
  createProductValidationRules,
  getProductValidationRules,
  updateProductValidationRules,
  deleteProductValidationRules,
} = require("../utils/validatorRules/productValidationRules");

const {
  getProducts,
  getSpecificProduct,
  createProduct,
  deleteProduct,
  updateProduct,
  uploadProductImages,
  resizeProductImages,
} = require("../controllers/productController");
const reviewRoute = require("./reviewRoute");
router.use("/:productId/reviews", reviewRoute);
router
  .route("/")
  .get(getProducts)
  .post(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    createProductValidationRules,
    createProduct
  );
router
  .route("/:id")
  .get(getProductValidationRules, getSpecificProduct)
  .put(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    updateProductValidationRules,
    updateProduct
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    deleteProductValidationRules,
    deleteProduct
  );

module.exports = router;
