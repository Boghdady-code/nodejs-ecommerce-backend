const express = require("express");

const router = express.Router();

const {
  registerValidationRules,
  loginValidationRules,
} = require("../utils/validatorRules/authValidationRules");

const {
  register,
  login,
  forgetPassword,
  verifyResetCode,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", registerValidationRules, register);
router.post("/login", loginValidationRules, login);
router.post("/forgetPassword", forgetPassword);
router.post("/verifyResetCode", verifyResetCode);
router.put("/resetPassword", resetPassword);

module.exports = router;
