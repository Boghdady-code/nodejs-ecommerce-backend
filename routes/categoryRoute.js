const express = require("express");

const router = express.Router();
const authController = require("../controllers/authController");
const {
  getCategoryValidationRules,
  createCategoryValidationRules,
  updateCategoryValidationRules,
  deleteCategoryValidationRules,
} = require("../utils/validatorRules/categoryValidationRules");

const {
  getCategories,
  createCategory,
  getSpecificCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeImage,
} = require("../controllers/categoryController");

const subCategoryRoute = require("./subCategoryRoute");

router.use("/:categoryId/subcategories", subCategoryRoute); //Child Route

router
  .route("/")
  .get(getCategories)
  .post(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImage,
    createCategoryValidationRules,
    createCategory
  );
router
  .route("/:id")
  .get(getCategoryValidationRules, getSpecificCategory)
  .put(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImage,
    updateCategoryValidationRules,
    updateCategory
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    deleteCategoryValidationRules,
    deleteCategory
  );

module.exports = router;
