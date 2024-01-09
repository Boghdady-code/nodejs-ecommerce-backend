const express = require("express");

const router = express.Router();
const authController = require("../controllers/authController");
const {
  getBrandValidationRules,
  deleteBrandValidationRules,
  updateBrandValidationRules,
  createBrandValidationRules,
} = require("../utils/validatorRules/brandValidationRules");

const {
  getBrands,
  getSpecificBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  resizeImage,
} = require("../controllers/brandController");

router
  .route("/")
  .get(getBrands)
  .post(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    createBrandValidationRules,
    createBrand
  );
router
  .route("/:id")
  .get(getBrandValidationRules, getSpecificBrand)
  .put(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    updateBrandValidationRules,
    updateBrand
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    deleteBrandValidationRules,
    deleteBrand
  );

module.exports = router;
