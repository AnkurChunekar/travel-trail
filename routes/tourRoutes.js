// external
const express = require("express");

// internal
const tourController = require("../controllers/tourController");

const router = express.Router();

router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.addNewTour);

module.exports = router;
