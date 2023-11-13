// external
const express = require("express");

// internal
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");

const { ROLES } = require("../constants");

const router = express.Router();

router.use("/:tourId/reviews", reviewRouter);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo(ROLES.ADMIN, ROLES.GUIDE_LEADER),
    tourController.addNewTour
  );

router.get(
  "/top-five-affordable",
  tourController.getTop5AffordableQuery,
  tourController.getAllTours
);

router.route("/stats").get(tourController.getTourStats);
router
  .route("/monthly-tour-analytics")
  .get(
    authController.protect,
    authController.restrictTo(ROLES.ADMIN, ROLES.GUIDE_LEADER, ROLES.GUIDE),
    tourController.getMonthlyTourAnalytics
  );

router.get(
  "/tours-within/:distance/center/:latlong/unit/:unit",
  tourController.getToursWithin
);

// patch -> update some fields in original object
// put -> original object will be completely replaced by new one

router
  .route("/:id")
  .get(tourController.getUniqueTour)
  .patch(
    authController.protect,
    authController.restrictTo(ROLES.ADMIN, ROLES.GUIDE_LEADER),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo(ROLES.ADMIN, ROLES.GUIDE_LEADER),
    tourController.deleteTour
  );

module.exports = router;
