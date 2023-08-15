const Tour = require("../models/tourModel");
const APIQueryFeatures = require("../utils/apiQueryFeatures");

exports.getTop5AffordableQuery = async (req, res, next) => {
  req.query = {
    page: 1,
    limit: 5,
    sort: "price,-ratingsAverage",
    projection: "_id,name,price,ratingsAverage,description,difficuilty"
  };
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // REFER TO docs/advanced-filtering.md FOR DOCUMENTATION

    // Build Query
    const features = new APIQueryFeatures(Tour.find(), req.query)
      .sanitizeQueryObj()
      .sort()
      .paginate()
      .project();

    // alternate for normal query
    // const query = Tour.find({})
    //   .where("duration")
    //   .equals(req.query.duration)
    //   .where("difficulty")
    //   .equals(req.query.difficulty);

    // Execute Query
    const tours = await features.query;

    res.json({
      results: tours.length,
      data: {
        tours
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

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: {
          ratingsAverage: { $gte: 4.5 }
        }
      },
      {
        $group: {
          _id: "$difficulty", // null if we want to group it to single document
          // _id: { $toUpper: "$difficulty" } // converts the obtained string to uppercase
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: { $round: "$price" } },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          ratingsCount: { $sum: "$ratingsQuantity" },
          toursCount: { $sum: 1 } // why 1? for each doc we will add 1 to the toursCount property
        }
      },
      {
        $sort: { minPrice: 1 }
      }
      // we can rewrite stages again if we want
      // {
      //   $match: { _id: { $ne: "easy" } }
      // }
    ]);

    res.status(200).json({
      status: "success",
      data: {
        stats
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
