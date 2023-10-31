const mongoose = require("mongoose");

// Docs for the features used here.
// Validation: https://mongoosejs.com/docs/validation.html
// virtuals: https://mongoosejs.com/docs/tutorials/virtuals.html
// middlewares: https://mongoosejs.com/docs/middleware.html

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxLength: [40, "Name can be maximum of 40 characters"],
      minLength: [10, "Name must be atleast of 10 characters"]
      // enum: ["Coffee", "Tea"] // if we want the string to be of fixed type
      // how to specify message ? check difficulty
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
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "difficulty can only be 'easy', 'medium', 'difficult'"
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
      min: [0, "Price cannot be a negative value"]
    },
    priceDiscount: {
      type: Number,
      validate: {
        // eslint-disable-next-line object-shorthand
        validator: function priceDiscountValidator(value) {
          return value < this.price;
        },
        message: "priceDiscount (i.e {VALUE}) should be less than price!"
      }
    },
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
    },
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"]
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User"
      }
    ]
  },
  { toJSON: { virtuals: true } },
  { toObject: { virtuals: true } }
);

tourSchema.virtual("durationInWeek").get(function getDurationInWeeks() {
  return (this.duration / 7).toFixed(2);
});
// obviously virtual properties cannot be used in queries, cause these are not present on documents in mongoDB

// We have modeled reviews tours using parent referencing!
// this reviews virtual will be used to populate all the reviews of the tour
// this will not be present on the actual doc in mongodb
// DOC: https://mongoosejs.com/docs/tutorials/virtuals.html#populate
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour", // So on Review model this tour's id is saved in tour property that's why tour here
  localField: "_id" // again id we are saving in review model property name is _id
  // justOne: true
});

// Just like express we mongoose also has middleware.

// DOCUMENT MIDDLEWARE
tourSchema.pre("save", function tourSchemaPre(next) {
  // console.log(this); // prints this current document to be saved.
  this.slug = this.name.toLowerCase().replaceAll(" ", "-");
  next();
});

// just to show that multiple middlewares can be added.
//  DOCUMENT middleware
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

tourSchema.pre(/^find/, function tourSchemaFindPre(next) {
  // `this` here is a query object not the document
  // chaining the find method
  this.populate({
    path: "guides",
    select:
      "-__v -passwordChangedAt -passwordResetToken -passwordResetTokenExpiry"
  });

  next();
});

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
