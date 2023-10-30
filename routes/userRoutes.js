const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const { ROLES } = require("../constants");

const router = express.Router();

// open endpoints
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:code", authController.resetPassword);

// auth needed for all the below endpoints
router.use(authController.protect);

router.patch("/updatePassword", authController.updatePassword);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);
router.get("/me", userController.getMe, userController.getUser);

// Admin only routes
router.use(authController.restrictTo(ROLES.ADMIN));

router.route("/").get(userController.getAllUsers);

module.exports = router;
