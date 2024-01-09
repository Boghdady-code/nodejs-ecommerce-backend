const { param, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddelware");

exports.getCategoryValidationRules = [ param("id")
  .isMongoId()
  .withMessage("Invalid Category ID Format"),
  validatorMiddleware
]

exports.createCategoryValidationRules = [
  body("name").notEmpty().withMessage("Category name is required").isLength({ min: 3}).withMessage("Category name must be at least 3 characters").isLength({ max: 32}).withMessage("Category name must be less than 32 characters"),
  validatorMiddleware
]

exports.updateCategoryValidationRules = [
  param("id").isMongoId().withMessage("Invalid Category ID Format"),
  body("name").notEmpty().withMessage("Category name is required").isLength({ min: 3}).withMessage("Category name must be at least 3 characters").isLength({ max: 32}).withMessage("Category name must be less than 32 characters"),
  validatorMiddleware
]

exports.deleteCategoryValidationRules = [
  param("id").isMongoId().withMessage("Invalid Category ID Format"),
  validatorMiddleware
]
