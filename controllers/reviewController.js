const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");

exports.modifyGetAllFilter = (req, res, next) => {
  if (req.params.tourId) req.getAllFilter = { tour: req.params.tourId };

  next();
};

exports.modifyAddReviewBody = (req, res, next) => {
  if (!req.body.tourId) req.body.tour = req.params.tourId;
  // eslint-disable-next-line no-underscore-dangle
  req.body.user = req.user._id;

  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.addNewReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
