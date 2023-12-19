const Razorpay = require("razorpay");

const Tour = require("../models/tourModel");
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
