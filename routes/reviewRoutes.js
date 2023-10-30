const express = require("express");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");
const { ROLES } = require("../constants");

// why merge params? -> https://expressjs.com/en/5x/api.html#express.router
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route("/")
  .get(reviewController.modifyGetAllFilter, reviewController.getAllReviews)
  .post(
    authController.restrictTo(ROLES.USER),
    reviewController.modifyAddReviewBody,
    reviewController.addNewReview
  );

router
  .route("/:id")
  .get(reviewController.getReview)
  .delete(
    authController.restrictTo(ROLES.USER, ROLES.ADMIN),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictTo(ROLES.USER, ROLES.ADMIN),
    reviewController.updateReview
  );

module.exports = router;
