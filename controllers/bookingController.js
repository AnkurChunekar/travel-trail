const Razorpay = require("razorpay");
const {
  validatePaymentVerification
} = require("razorpay/dist/utils/razorpay-utils");

const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const catchAsyncError = require("../utils/catchAsyncError");
const CustomError = require("../utils/customError");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

exports.getCheckoutSession = catchAsyncError(async (req, res, next) => {
  // 1. Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  if (!tour)
    return next(
      new CustomError(
        "Specified tour does not exists, please try booking a valid tour",
        404
      )
    );

  // 2. Create a order
  const currency = "INR";

  const response = await razorpay.orders.create({
    amount: tour.price * 100,
    currency
  });

  // 3. Create order as response

  res.status(200).json({
    status: "success",
    image: `${req.protocol}://${req.get("host")}/img/logo-green-round.png`,
    userName: req.user.name,
    userEmail: req.user.email,
    order: {
      id: response.id,
      currency: response.currency,
      amount: response.amount
    }
  });
});

exports.verifyPaymentAndCreateBooking = catchAsyncError(
  async (req, res, next) => {
    try {
      const { orderId, paymentId, signiture, tourId, price } = req.body;

      // Validate the payment
      const isValid = validatePaymentVerification(
        { order_id: orderId, payment_id: paymentId },
        signiture,
        process.env.RAZORPAY_SECRET
      );

      if (!isValid)
        return next(new CustomError("Inavlid Payment, please try again", 403));

      // Create a booking
      await Booking.create({
        tour: tourId,
        user: req.user.id,
        price
      });

      // Send appropriate response
      res.json({ status: "success", message: "Tour Booked Successfully" });
    } catch (error) {
      next(new CustomError("Inavlid Payment, please try again", 403));
    }
  }
);
