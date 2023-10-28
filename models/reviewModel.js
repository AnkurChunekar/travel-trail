const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "A Review is required"]
    },
    rating: {
      type: Number,
      required: [true, "A Rating is required"],
      max: 5,
      min: 1
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour"]
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"]
    },
    createdAt: {
      type: Date,
      default: Date.now()
    }
  },
  { toJSON: { virtuals: true } },
  { toObject: { virtuals: true } }
);

// QUERY MIDDLEWARE
reviewSchema.pre(/^find/, function populateData(next) {
  this.populate({
    path: "user",
    select: "name"
  }).populate({
    path: "tour",
    select: "name photo"
  });

  next();
});

const Review = new mongoose.model("Review", reviewSchema);

module.exports = Review;
