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

  res.setHeader(
    "Content-Security-Policy",
    "script-src  'self' unpkg.com",
    "script-src-elem 'self' unpkg.com"
  );

  res.status(200).render("tour", { title: `${tour.name} Tour`, tour });
});
