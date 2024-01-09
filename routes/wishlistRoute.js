const express = require("express");

const router = express.Router();
const authController = require("../controllers/authController");

const {
  addToWishlist,
  removeFromWishlist,
  getLoggedInUserWishlist,
} = require("../controllers/wishlistController");

router.use(authController.protect, authController.allowedTo("user"));

router.route("/").get(getLoggedInUserWishlist).post(addToWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;
