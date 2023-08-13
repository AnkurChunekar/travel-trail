const Tour = require("../models/tourModel");

const EXCLUDE_QUERY_PARAMS = ["limit", "sort", "page", "projection"];
const QUERY_OPERATORS_REGEX = /\b(gte|gt|lte|lt)\b/g;

exports.getAllTours = async (req, res) => {
  try {
    // REFER TO docs/advanced-filtering.md FOR DOCUMENTATION

    let queryObj = { ...req.query };

    EXCLUDE_QUERY_PARAMS.forEach((item) => delete queryObj[item]);

    // 1. QUERYING
    queryObj = JSON.parse(
      JSON.stringify(queryObj).replace(
        QUERY_OPERATORS_REGEX,
        (matched) => `$${matched}`
      )
    );

    // Build Query
    const query = Tour.find(queryObj);

    // 2. SORTING
    if (req.query.sort) {
      query.sort(req.query.sort.replaceAll(",", " "));
    } else query.sort("-createdAt");

    // 3. PROJECTTION
    if (req.query.projection) {
      query.select(req.query.projection.split(","));
    }

    // 4. Pagination
    // by default we will keep 100 as limit, why? think if there are million records then?
    let page = Number(req.query.page) || 1;
    if (page < 1) page = 1;
    const limit = Math.abs(Number(req.query.limit)) || 100;
    const skip = limit * (page - 1);

    query.skip(skip).limit(limit);

    // check if requested page no. is more than existing page count
    if (req.query.page) {
      const numOfTours = await Tour.countDocuments();
      if (skip >= numOfTours) throw new Error("Requested page does not exist.");
    }

    // alternate for normal query
    // const query = Tour.find({})
    //   .where("duration")
    //   .equals(req.query.duration)
    //   .where("difficulty")
    //   .equals(req.query.difficulty);

    // Execute Query
    const tours = await query;

    res.json({
      results: tours.length,
      // sortStr: req.query.sort.replaceAll(",", " "),
      data: {
        tours
      },
      query: queryObj
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
