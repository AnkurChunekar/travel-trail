const Tour = require("../models/tourModel");

const EXCLUDE_QUERY_PARAMS = ["limit", "sort", "page", "projection"];
const QUERY_OPERATORS_REGEX = /\b(gte|gt|lte|lt)\b/g;

exports.getTop5AffordableQuery = async (req, res, next) => {
  req.query = {
    page: 1,
    limit: 5,
    sort: "price,-ratingsAverage",
    projection: "_id,name,price,ratingsAverage,description,difficuilty"
  };
  next();
};

class APIQueryFeatures {
  constructor(query, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }

  sanitizeQueryObj() {
    let result = { ...this.queryObj };

    EXCLUDE_QUERY_PARAMS.forEach((item) => delete result[item]);

    // 1. QUERYING
    result = JSON.parse(
      JSON.stringify(result).replace(
        QUERY_OPERATORS_REGEX,
        (matched) => `$${matched}`
      )
    );

    this.query.find(result);
    return this;
  }

  sort() {
    if (this.queryObj.sort) {
      this.query.sort(this.queryObj.sort.replaceAll(",", " "));
    } else this.query.sort("-createdAt");
    return this;
  }

  project() {
    if (this.queryObj.projection) {
      this.query.select(this.queryObj.projection.split(","));
    }
    return this;
  }

  paginate() {
    // by default we will keep 100 as limit, why? think if there are million records then?
    let page = Number(this.queryObj.page) || 1;
    if (page < 1) page = 1;
    const limit = Math.abs(Number(this.queryObj.limit)) || 100;
    const skip = limit * (page - 1);

    this.query.skip(skip).limit(limit);
    return this;
  }
}

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
