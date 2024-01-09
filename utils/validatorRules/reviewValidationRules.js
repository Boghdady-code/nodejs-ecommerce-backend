const { param, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddelware");
const ReviewModel = require("../../models/reviewModel");

exports.createReviewValidationRules = [
  body("title").optional(),
  body("ratings")
    .notEmpty()
    .withMessage("Rating is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("user").isMongoId().withMessage("Invalid User ID Format"),
  body("product")
    .isMongoId()
    .withMessage("Invalid Product ID Format")
    .custom((val, { req }) => {
      return ReviewModel.findOne({
        user: req.user._id,
        product: req.body.product,
      }).then((review) => {
        if (review) {
          return Promise.reject(
            "You have already reviewed this product before"
          );
        }
      });
    }),
  validatorMiddleware,
];

exports.getReviewValidationRules = [
  param("id").isMongoId().withMessage("Invalid Review ID Format"),
  validatorMiddleware,
];

exports.updateReviewValidationRules = [
  param("id")
    .isMongoId()
    .withMessage("Invalid Review ID Format")
    .custom((val, { req }) => {
      return ReviewModel.findById(val).then((review) => {
        if (!review) {
          return Promise.reject("No review found with this ID");
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            "You are not authorized to perform this action"
          );
        }
      });
    }),
  validatorMiddleware,
];

exports.deleteReviewValidationRules = [
  param("id")
    .isMongoId()
    .withMessage("Invalid Review ID Format")
    .custom((val, { req }) => {
      if (req.user.role === "user") {
        return ReviewModel.findById(val).then((review) => {
          if (!review) {
            return Promise.reject("No review found with this ID");
          }
          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              "You are not authorized to perform this action"
            );
          }
        });
      } else {
        return ReviewModel.findById(val).then((review) => {
          if (!review) {
            return Promise.reject("No review found with this ID");
          }
        });
      }
    }),
  validatorMiddleware,
];
