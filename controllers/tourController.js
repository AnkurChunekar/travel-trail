const Tour = require("../models/tourModel");

exports.getAllTours = async (req, res) => {
  try {
    // Build Query
    const query = Tour.find(req.query);

    // alternate
    // const query = Tour.find({})
    //   .where("duration")
    //   .equals(req.query.duration)
    //   .where("difficulty")
    //   .equals(req.query.difficulty);

    // Execute Query
    const tours = await query;

    res.json({
      results: tours.length,
      data: {
        tours
      },
      query: req.query
    });
  } catch (error) {
    res.status(400).json({
      error: "Something went wrong"
    });
  }
};

exports.addNewTour = async (req, res) => {
  try {
    const result = await Tour.create(req.body);
    // .create can take array of multiple objects also

    /*  

    Alternative way
    const tour = new Tour({...data_here});
    const result = await tour.save();

    */

    res.status(201).json({
      message: "Success, added new doc",
      data: {
        tour: result
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({
      message: error.message
    });
  }
};

exports.getUniqueTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // alternate
    // Tour.findOne({ _id: req.params.id })
    res.json({
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(400).json({
      error: "Something went wrong"
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      data: {
        tour
      }
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Something went wrong",
      message: error.message
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Something went wrong",
      message: error.message
    });
  }
};
