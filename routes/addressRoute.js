const express = require("express");

const router = express.Router();
const authController = require("../controllers/authController");

const {
  addToAddresses,
  getLoggedInUserAddresses,
  removeAddress,
} = require("../controllers/addressController");

router.use(authController.protect, authController.allowedTo("user"));

router.route("/").get(getLoggedInUserAddresses).post(addToAddresses);
router.delete("/:addressId", removeAddress);

module.exports = router;
