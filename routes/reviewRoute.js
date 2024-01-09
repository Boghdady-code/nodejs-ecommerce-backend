const express = require("express");

const router = express.Router({ mergeParams: true });
const authController = require("../controllers/authController");
const {
  createReviewValidationRules,
  getReviewValidationRules,
  deleteReviewValidationRules,
  updateReviewValidationRules,
} = require("../utils/validatorRules/reviewValidationRules");

const {
  getReviews,
  getSpecificReview,
  createReview,
  updateReview,
  deleteReview,
  setProductIdAndUserIdToBody,
} = require("../controllers/reviewController");

router
  .route("/")
  .get(getReviews)
  .post(
    authController.protect,
    authController.allowedTo("user"),
    setProductIdAndUserIdToBody,
    createReviewValidationRules,
    createReview
  );
router
  .route("/:id")
  .get(getReviewValidationRules, getSpecificReview)
  .put(
    authController.protect,
    authController.allowedTo("user"),
    updateReviewValidationRules,
    updateReview
  )
  .delete(
    authController.protect,
    authController.allowedTo("user", "admin", "manager"),
    deleteReviewValidationRules,
    deleteReview
  );

module.exports = router;
