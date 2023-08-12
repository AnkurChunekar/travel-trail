const Tour = require("../models/tourModel");

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find({});
    res.json({
      message: "Hello bro",
      tours
    });
  } catch (error) {
    res.status(400).json({
      error: "Something went wrong"
    });
  }
};

exports.addNewTour = async (req, res) => {
  try {
    const { name, rating, price } = req.body;
    const tour = new Tour({
      name,
      rating,
      price
    });

    const result = await tour.save();
    res.json({
      message: "Success, added new doc",
      result
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({
      message: error.message
    });
  }
};
