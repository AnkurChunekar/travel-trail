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

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// QUERY MIDDLEWARE
reviewSchema.pre(/^find/, function populateData(next) {
  this.populate({
    path: "user",
    select: "name photo"
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

    const calculatedData = result.length
      ? result[0]
      : { avgRating: 0, noOfRating: 0 };

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
  } catch (error) {
    console.error(
      "Error occured while updating ratings average and ratings count in tour document",
      error
    );
  }
};

reviewSchema.post("save", async function (doc) {
  this.constructor.calculateRatingsAverage(doc.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  switch (this.op) {
    case "findOneAndUpdate":
      this.tourId = this.getUpdate().tour;
      break;
    case "findOneAndDelete":
      this.tourId = this.getQuery().tour;
      break;

    default:
  }

  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.tourId) {
    const model = new this.model();
    model.constructor.calculateRatingsAverage(this.tourId);
  } else
    console.error("Unable to find the tour Id to update ratings avg and count");
});

const Review = new mongoose.model("Review", reviewSchema);

module.exports = Review;
