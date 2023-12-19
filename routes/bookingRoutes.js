// external
const express = require("express");

// internal
const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get(
  "/checkout-session/:tourId",
  authController.protect,
  bookingController.getCheckoutSession
);

router.post(
  "/verify-payment",
  authController.protect,
  bookingController.verifyPaymentAndCreateBooking
);

module.exports = router;
