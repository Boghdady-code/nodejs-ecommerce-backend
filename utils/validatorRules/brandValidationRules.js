const { param, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddelware");

exports.getBrandValidationRules = [
  param("id").isMongoId().withMessage("Invalid Brand ID Format"),
  validatorMiddleware,
];

exports.createBrandValidationRules = [
  body("name")
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ min: 3 })
    .withMessage("Brand name must be at least 3 characters")
    .isLength({ max: 32 })
    .withMessage("Brand name must be less than 32 characters"),
  validatorMiddleware,
];

exports.updateBrandValidationRules = [
  param("id").isMongoId().withMessage("Invalid Brand ID Format"),
  body("name")
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ min: 3 })
    .withMessage("Brand name must be at least 3 characters")
    .isLength({ max: 32 })
    .withMessage("Brand name must be less than 32 characters"),
  validatorMiddleware,
];

exports.deleteBrandValidationRules = [
  param("id").isMongoId().withMessage("Invalid Brand ID Format"),
  validatorMiddleware,
];
