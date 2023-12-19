const express = require("express");

// internal
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.isViewClientLoggedIn);

router.get(
  "/",
  authController.isViewClientLoggedIn,
  viewController.getOverview
);
router.get(
  "/tour/:slug",
  authController.isViewClientLoggedIn,
  viewController.getTour
);
router.get(
  "/login",
  authController.isViewClientLoggedIn,
  viewController.userLogin
);
router.get("/me", authController.protect, viewController.getAccount);
router.get("/my-tours", authController.protect, viewController.getAllTours);

module.exports = router;
