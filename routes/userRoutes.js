const express = require("express");
const multer = require("multer");

const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const { ROLES } = require("../constants");

const router = express.Router();
const upload = multer({ dest: "public/img/users" });

// open endpoints
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:code", authController.resetPassword);

// auth needed for all the below endpoints
router.use(authController.protect);

router.patch("/updatePassword", authController.updatePassword);
// why upload.single? -> cause we want it to be single image upload at a time (i.e single file).
router.patch("/updateMe", upload.single("photo"), userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);
router.get("/me", userController.getMe, userController.getUser);

// Admin only routes
router.use(authController.restrictTo(ROLES.ADMIN));

router.route("/").get(userController.getAllUsers);

module.exports = router;
