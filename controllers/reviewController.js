const catchAsyncError = require("../utils/catchAsyncError");
const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");

exports.getAllReviews = catchAsyncError(async (req, res) => {
  let filter = {};

  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.json({
    results: reviews.length,
    data: {
      reviews
    }
  });
});

exports.modifyAddReviewBody = (req, res, next) => {
  if (!req.body.tourId) req.body.tourId = req.params.tourId;

  next();
};

exports.getReview = factory.getOne(Review);
exports.addNewReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
