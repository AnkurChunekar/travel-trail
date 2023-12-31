const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const catchAsyncError = require("../utils/catchAsyncError");
const CustomError = require("../utils/customError");

exports.getOverview = catchAsyncError(async (_, res) => {
  // 1. Get all tours
  const tours = await Tour.find();

  res.status(200).render("overview", { title: "All Tours", tours });
});

exports.getTour = catchAsyncError(async (req, res, next) => {
  const { slug } = req.params;
  const tour = await Tour.findOne({ slug }).populate({
    path: "reviews",
    fields: "review rating user"
  });

  if (!tour)
    return next(
      new CustomError("A tour with the provided name does not exist", 404)
    );

  res.status(200).render("tour", { title: `${tour.name} Tour`, tour });
});

exports.userLogin = catchAsyncError(async (_, res) => {
  res.status(200).render("login", { title: "Log into your account" });
});

exports.userSignup = catchAsyncError(async (_, res) => {
  res.status(200).render("login", { title: "Create an account" });
});

exports.getAccount = catchAsyncError(async (_, res) => {
  res.status(200).render("account", {
    title: "My Account"
  });
});

exports.getAllTours = catchAsyncError(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tours = await Tour.find({
    _id: { $in: bookings.map((item) => item.tour) }
  });

  res.status(200).render("overview", {
    title: "My Tour Bookings",
    tours
  });
});
