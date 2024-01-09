const { param, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddelware");


exports.createSubCategoryValidationRules = [
  body("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2 })
    .withMessage("Category name must be at least 2 characters")
    .isLength({ max: 32 })
    .withMessage("Category name must be less than 32 characters"),
  body("category").notEmpty().withMessage("Category is required").isMongoId().withMessage("Invalid Category ID Format"),  
  validatorMiddleware,
];



exports.getSubCategoryValidationRules = [
  param("id").isMongoId().withMessage("Invalid Category ID Format"),
  validatorMiddleware,
];


exports.updateSubCategoryValidationRules = [
  param("id").isMongoId().withMessage("Invalid Category ID Format"),
  validatorMiddleware,
];

exports.deleteSubCategoryValidationRules = [
  param("id").isMongoId().withMessage("Invalid Category ID Format"),
  validatorMiddleware,
];
