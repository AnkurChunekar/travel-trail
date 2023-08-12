// external
const express = require("express");

// internal
const tourController = require("../controllers/tourController");

const router = express.Router();

router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.addNewTour);

// patch -> update some fields in original object
// put -> original object will be completely replaced by new one

router
  .route("/:id")
  .get(tourController.getUniqueTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;

