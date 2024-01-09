const { param, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddelware");
const UserModel = require("../../models/userModel");
const slugify = require("slugify");

exports.registerValidationRules = [
  body("name")
    .notEmpty()
    .withMessage("User name is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .custom((val) => {
      return UserModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject("Email already existsd");
        }
      });
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required"),
  validatorMiddleware,
];

exports.loginValidationRules = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  validatorMiddleware,
];
