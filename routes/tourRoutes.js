// external
const express = require("express");

// internal
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.addNewTour);

router.get(
  "/top-five-affordable",
  tourController.getTop5AffordableQuery,
  tourController.getAllTours
);

router.route("/stats").get(tourController.getTourStats);
router
  .route("/monthly-tour-analytics")
  .get(tourController.getMonthlyTourAnalytics);

// patch -> update some fields in original object
// put -> original object will be completely replaced by new one

router
  .route("/:id")
  .get(tourController.getUniqueTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
