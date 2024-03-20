const { param, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddelware");
const UserModel = require("../../models/userModel");
const bcrypt = require("bcryptjs");

exports.getUserValidationRules = [
  param("id").isMongoId().withMessage("Invalid Brand ID Format"),
  validatorMiddleware,
];

exports.createUserValidationRules = [
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
          return Promise.reject("Email already exists");
        }
      });
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((val, { req }) => {
      if (val !== req.body.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required"),
  body("role").optional(),
  body("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Please enter a valid Egypt or KSA phone number"),
  body("profileImg").optional(),

  validatorMiddleware,
];

exports.updateUserValidationRules = [
  param("id").isMongoId().withMessage("Invalid Brand ID Format"),
  validatorMiddleware,
];

exports.updateUserPasswordValidationRules = [
  param("id").isMongoId().withMessage("Invalid User id format"),
  body("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("You must enter the password confirm"),
  body("password")
    .notEmpty()
    .withMessage("You must enter new password")
    .custom(async (val, { req }) => {
      // 1) Verify current password
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        throw new Error("There is no user for this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect current password");
      }

      // 2) Verify password confirm
      if (val !== req.body.confirmPassword) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  validatorMiddleware,
];

exports.deleteUserValidationRules = [
  param("id").isMongoId().withMessage("Invalid Brand ID Format"),
  validatorMiddleware,
];

exports.updateLoggedUserValidationRules = [
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
          return Promise.reject("Email already exists");
        }
      });
    }),
  body("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Please enter a valid Egypt or KSA phone number"),
];
