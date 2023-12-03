const Tour = require("../models/tourModel");
const catchAsyncError = require("../utils/catchAsyncError");

exports.getOverview = catchAsyncError(async (_, res) => {
  // 1. Get all tours
  const tours = await Tour.find();

  res.status(200).render("overview", { title: "All Tours", tours });
});

exports.getTour = catchAsyncError(async (req, res) => {
  const { slug } = req.params;
  const tour = await Tour.findOne({ slug }).populate({
    path: "reviews",
    fields: "review rating user"
  });

  res.status(200).render("tour", { title: `${tour.name} Tour`, tour });
});

exports.userLogin = catchAsyncError(async (_, res) => {
  res.status(200).render("login", { title: "Log into your account" });
});

exports.userSignup = catchAsyncError(async (_, res) => {
  res.status(200).render("login", { title: "Create an account" });
});
