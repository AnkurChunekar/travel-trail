const express = require("express");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");
const { ROLES } = require("../constants");

// why merge params? -> https://expressjs.com/en/5x/api.html#express.router
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(authController.protect, reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo(ROLES.USER),
    reviewController.addNewReview
  );

module.exports = router;
