const express = require("express");

// merge Params allows us to access the params from categoryRoute by accessing categoryid from categoryRoute
const router = express.Router({ mergeParams: true });
const authController = require("../controllers/authController");
const {
  createSubCategory,
  getSpecificSubCategory,
  getSubCategories,
  deleteSubCategory,
  updateSubCategory,
  setCategoryidToBody,
} = require("../controllers/subCategoryController");
const {
  createSubCategoryValidationRules,
  getSubCategoryValidationRules,
  updateSubCategoryValidationRules,
  deleteSubCategoryValidationRules,
} = require("../utils/validatorRules/subCategoryValidationRules");

router
  .route("/:id")
  .get(getSubCategoryValidationRules, getSpecificSubCategory)
  .put(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    updateSubCategoryValidationRules,
    updateSubCategory
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    deleteSubCategoryValidationRules,
    deleteSubCategory
  );
router
  .route("/")
  .post(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    setCategoryidToBody,
    createSubCategoryValidationRules,
    createSubCategory
  )
  .get(getSubCategories);

module.exports = router;
