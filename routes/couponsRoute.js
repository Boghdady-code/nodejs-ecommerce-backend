const express = require("express");

const router = express.Router();
const authController = require("../controllers/authController");

const {
  createCoupon,
  deleteCoupon,
  getCoupons,
  getSpecificCoupon,
  updateCoupon,
} = require("../controllers/couponController");

router.use(authController.protect, authController.allowedTo("admin"));
router.route("/").get(getCoupons).post(createCoupon);
router
  .route("/:id")
  .get(getSpecificCoupon)
  .put(updateCoupon)
  .delete(deleteCoupon);

module.exports = router;
