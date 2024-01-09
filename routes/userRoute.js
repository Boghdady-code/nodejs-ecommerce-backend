const express = require("express");

const router = express.Router();
authController = require("../controllers/authController");
const {
  getUserValidationRules,
  deleteUserValidationRules,
  updateUserValidationRules,
  createUserValidationRules,
  updateUserPasswordValidationRules,
  updateLoggedUserValidationRules,
} = require("../utils/validatorRules/userValidationRules");

const {
  getUsers,
  getSpecificUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  updateUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
} = require("../controllers/userController");

router.get("/me", authController.protect, getLoggedUserData, getSpecificUser);
router.put(
  "/changeMyPassword",
  authController.protect,
  updateLoggedUserPassword
);
router.put(
  "/updateMe",
  updateLoggedUserValidationRules,
  authController.protect,
  updateLoggedUserData
);

router.put(
  "/password/:id",
  updateUserPasswordValidationRules,
  updateUserPassword
);

router
  .route("/")
  .get(authController.protect, authController.allowedTo("admin"), getUsers)
  .post(
    authController.protect,
    authController.allowedTo("admin"),
    uploadUserImage,
    resizeImage,
    createUserValidationRules,
    createUser
  );
router
  .route("/:id")
  .get(
    authController.protect,
    authController.allowedTo("admin"),
    getUserValidationRules,
    getSpecificUser
  )
  .put(
    authController.protect,
    authController.allowedTo("admin"),
    uploadUserImage,
    resizeImage,
    updateUserValidationRules,
    updateUser
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    deleteUserValidationRules,
    deleteUser
  );

module.exports = router;
