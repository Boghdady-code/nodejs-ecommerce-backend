const express = require("express");

const router = express.Router();
const authController = require("../controllers/authController");

const {
  createCashOrder,
  getAllOrders,
  getLoggedUserOrders,
  getSpecificOrder,
  updateDeliveredStatus,
  updatePaidStatus,
  checkoutSession,
} = require("../controllers/orderController");
router.use(authController.protect);

router
  .route("/checkout-session/:cartId")
  .post(authController.allowedTo("user"), checkoutSession);

router
  .route("/:cartId")
  .post(authController.allowedTo("user"), createCashOrder);
router
  .route("/")
  .get(
    authController.protect,
    authController.allowedTo("admin", "user"),
    getLoggedUserOrders,
    getAllOrders
  );

router.route("/:id").get(getSpecificOrder);

router
  .route("/:id/pay")
  .put(authController.allowedTo("admin"), updatePaidStatus);
router
  .route("/:id/deliver")
  .put(authController.allowedTo("admin"), updateDeliveredStatus);

module.exports = router;
