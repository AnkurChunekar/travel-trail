const mongoose = require("mongoose");

const tourSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name and it should be a string"],
    unique: true
  },
  rating: {
    type: Number,
    required: [true, "A tour must have a rating and it should be a number"],
    default: 3
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price and it should be a number"]
  }
});

const Tour = new mongoose.model("Tour", tourSchema);

module.exports = Tour;
