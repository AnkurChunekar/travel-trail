const Tour = require("../models/tourModel");
const catchAsyncError = require("../utils/catchAsyncError");

exports.getOverview = catchAsyncError(async (_, res) => {
  // 1. Get all tours
  const tours = await Tour.find();

  res.status(200).render("overview", { title: "All Tours", tours });
});

exports.getTour = (_, res) => {
  res.status(200).render("tour", { title: "The Forest Hiker" });
};
