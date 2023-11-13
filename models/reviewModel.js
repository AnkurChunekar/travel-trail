const mongoose = require("mongoose");
const Tour = require("./tourModel");

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
  { toJSON: { virtuals: true } }, // why this? -> https://mongoosejs.com/docs/tutorials/virtuals.html#virtuals-in-json
  { toObject: { virtuals: true } } // why this? -> https://mongoosejs.com/docs/tutorials/virtuals.html#virtuals-in-json
);

// QUERY MIDDLEWARE
reviewSchema.pre(/^find/, function populateData(next) {
  this.populate({
    path: "user",
    select: "name"
  });

  // this.populate({
  //   path: "user",
  //   select: "name"
  // }).populate({
  //   path: "tour",
  //   select: "name photo"
  // });

  next();
});

reviewSchema.statics.calculateRatingsAverage = async function (tourId) {
  try {
    const result = await this.aggregate([
      {
        $match: { tour: new mongoose.Types.ObjectId(tourId) }
      },
      {
        $group: {
          _id: "$tour",
          avgRating: { $avg: "$rating" },
          noOfRating: { $sum: 1 }
        }
      }
    ]);

    if (result.length) {
      const calculatedData = result[0];
      await Tour.findByIdAndUpdate(
        tourId,
        {
          ratingsAverage: calculatedData.avgRating.toFixed(1),
          ratingsQuantity: calculatedData.noOfRating
        },
        {
          runValidators: true
        }
      );
      console.log(
        "Ratings average and count updated successfully",
        calculatedData
      );
    }
  } catch (error) {
    console.error(
      "Error occured while updating ratings average and ratings count in tour document"
    );
  }
};

reviewSchema.post("save", async function (doc) {
  this.constructor.calculateRatingsAverage(doc.tour);
});

reviewSchema.post(/^findOneAnd/, async function () {
  const review = await this.findOne().clone().exec();
  review.constructor.calculateRatingsAverage(review.tour);
});

const Review = new mongoose.model("Review", reviewSchema);

module.exports = Review;
