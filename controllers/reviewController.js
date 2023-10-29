const catchAsyncError = require("../utils/catchAsyncError");
const Review = require("../models/reviewModel");

exports.getAllReviews = catchAsyncError(async (req, res) => {
  const reviews = await Review.find({ user: req.user.id });

  res.json({
    results: reviews.length,
    data: {
      reviews
    }
  });
});

exports.addNewReview = catchAsyncError(async (req, res) => {
  if (!req.body.tourId) req.body.tourId = req.params.tourId;

  const { review, rating, tourId } = req.body;

  const newReview = await Review.create({
    user: req.user.id,
    review,
    rating,
    tour: tourId
  });

  res.status(201).json({
    message: "Review added successfully",
    data: newReview
  });
});
