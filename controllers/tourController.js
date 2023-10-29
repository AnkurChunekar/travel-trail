const Tour = require("../models/tourModel");
const APIQueryFeatures = require("../utils/apiQueryFeatures");
const catchAsyncError = require("../utils/catchAsyncError");
const CustomError = require("../utils/customError");
const factory = require("./handlerFactory");

exports.getTop5AffordableQuery = async (req, res, next) => {
  req.query = {
    page: 1,
    limit: 5,
    sort: "price,-ratingsAverage",
    projection: "_id,name,price,ratingsAverage,description,difficuilty"
  };
  next();
};

exports.getAllTours = catchAsyncError(async (req, res) => {
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
});

exports.addNewTour = catchAsyncError(async (req, res) => {
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
});

exports.getUniqueTour = catchAsyncError(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate("reviews");
  // alternate
  // Tour.findOne({ _id: req.params.id })

  if (!tour) {
    return next(new CustomError("Tour not found!", 404));
  }

  res.json({
    data: {
      tour
    }
  });
});

exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsyncError(async (req, res) => {
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
});

// eslint-disable-next-line consistent-return
exports.getMonthlyTourAnalytics = catchAsyncError(async (req, res) => {
  const year = Number(req.query.year);

  if (!year) {
    return res.status(400).json({
      error: "Year is required!",
      message: "Year is required!"
    });
  }

  const stats = await Tour.aggregate([
    { $unwind: "$startDates" },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numberOfToursStarting: { $sum: 1 },
        tours: {
          $push: "$name"
        }
      }
    },
    { $addFields: { month: "$_id" } },
    { $project: { _id: 0 } },
    {
      $sort: { numberOfToursStarting: -1 }
    },
    { $limit: 3 } // limiting it to only top 3
  ]);

  if (stats.length < 1) {
    return res.status(404).json({
      error: "No records found for provided year.",
      message: "No records found for provided year."
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      stats
    }
  });
});
