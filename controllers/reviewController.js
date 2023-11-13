const Review = require("../models/reviewModel");
const catchAsyncError = require("../utils/catchAsyncError");
const CustomError = require("../utils/customError");
const factory = require("./handlerFactory");

exports.modifyGetAllFilter = (req, res, next) => {
  if (req.params.tourId) req.getAllFilter = { tour: req.params.tourId };

  next();
};

exports.modifyReviewBody = (req, res, next) => {
  if (!req.body.tourId) req.body.tour = req.params.tourId;
  // eslint-disable-next-line no-underscore-dangle
  req.body.user = req.user._id;

  next();
};

exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const doc = await Review.findOneAndDelete({
    _id: req.params.id,
    tour: req.body.tour
  });

  if (!doc)
    return next(new CustomError("No document found for the provided ID"));

  res.status(204).json({
    status: "success",
    data: null
  });
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.addNewReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
