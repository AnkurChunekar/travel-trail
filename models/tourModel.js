const mongoose = require("mongoose");

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
      unique: false
    },
    maxGroupSize: {
      type: String,
      required: [true, "A tour must have a maxGroupSize"]
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"]
    },
    ratingsAverage: {
      type: Number,
      default: 4.5
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"]
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"]
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    isPrivateTour: {
      type: Boolean,
      default: false
    }
  },
  { toJSON: { virtuals: true } },
  { toObject: { virtuals: true } }
);

// Docs for virtuals: https://mongoosejs.com/docs/tutorials/virtuals.html
tourSchema.virtual("durationInWeek").get(function getDurationInWeeks() {
  return (this.duration / 7).toFixed(2);
});
// obviously virtual properties cannot be used in queries, cause these are not present on documents in mongoDB

// Just like express we mongoose also has middleware.
// Docs: https://mongoosejs.com/docs/middleware.html

// DOCUMENT MIDDLEWARE
tourSchema.pre("save", function tourSchemaPre(next) {
  // console.log(this); // prints this current document to be saved.
  this.slug = this.name.toLowerCase().replaceAll(" ", "-");
  next();
});

// just to show that multiple middlewares can be added.
// tourSchema.pre("save", function tourSchemaPreAgain(next) {
//   console.log(`Just printing name: ${this.name} b4 saving the doc.`);
//   next();
// });

// tourSchema.post("save", (doc, next) => {
//   console.log("From mongoose document post middleware", { doc });
//   next();
// });

// QUERY MIDDLEWARE
// have used a regex here match any string that starts with find such as findOne, find, etc

// tourSchema.pre(/^find/, function tourSchemaFindPre(next) {
//   // `this` here is a query object not the document
//   // chaining the find method
//   this.find({ isPrivateTour: { $ne: true } });

//   this.start = Date.now();
//   next();
// });

// tourSchema.post(/^find/, function tourSchemaFindPre(docs, next) {
//   // `this` here is a query object not the document
//   // chaining the find method
//   console.log(`Query took ${Date.now() - this.start} ms to run.`);
//   next();
// });

// AGGREGATION MIDDLEWARE

// tourSchema.pre("aggregate", function tourSchemaFindPre(next) {
//   // `this` here is a current aggregation object not the document
//   // console.log(this._pipeline); // prints the pipeline array
//   this._pipeline.unshift({ $match: { isPrivateTour: { $ne: true } } });
//   next();
// });

const Tour = new mongoose.model("Tour", tourSchema);

module.exports = Tour;
