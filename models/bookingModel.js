const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Booking must belong to a tour"]
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Booking must belong to a user"]
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    paid: {
      type: Boolean,
      default: true
    },
    price: {
      type: Number,
      required: [true, "A booking must contain a tour price"]
    }
  },
  { toJSON: { virtuals: true } }, // why this? -> https://mongoosejs.com/docs/tutorials/virtuals.html#virtuals-in-json
  { toObject: { virtuals: true } } // why this? -> https://mongoosejs.com/docs/tutorials/virtuals.html#virtuals-in-json
);

bookingSchema.pre(/^find/, function (next) {
  this.populate("user").populate({ path: "tour", select: "name" });
  next();
});

const Booking = new mongoose.model("Booking", bookingSchema);

module.exports = Booking;
