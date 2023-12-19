// external
const express = require("express");

// internal
const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");
const { ROLES } = require("../constants");

const router = express.Router();

router.use(authController.protect);

router.get("/checkout-session/:tourId", bookingController.getCheckoutSession);
router.post("/verify-payment", bookingController.verifyPaymentAndCreateBooking);

// Restrict below routes for admin and leadGuides

router.use(authController.restrictTo(ROLES.ADMIN, ROLES.GUIDE_LEADER));

router
  .route("/")
  .get(bookingController.getAllBookings)
  .post(bookingController.addNewBooking);

router
  .route("/:id")
  .get(bookingController.getUniqueBooking)
  .put(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
