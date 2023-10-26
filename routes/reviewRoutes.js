const express = require("express");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");
const { ROLES } = require("../constants");

const router = express.Router();

router
  .route("/")
  .get(authController.protect, reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo(ROLES.USER),
    reviewController.addNewReview
  );

module.exports = router;
