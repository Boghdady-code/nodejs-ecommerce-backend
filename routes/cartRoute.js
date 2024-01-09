const express = require("express");

const router = express.Router();
const authController = require("../controllers/authController");

const {
  addToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearCart,
  updateQuantity,
  applyCoupon,
} = require("../controllers/cartController");

router.use(authController.protect, authController.allowedTo("user"));
router.route("/").post(addToCart).get(getLoggedUserCart).delete(clearCart);
router.put("/applyCoupon", applyCoupon);
router.route("/:itemId").delete(removeSpecificCartItem).put(updateQuantity);

module.exports = router;
