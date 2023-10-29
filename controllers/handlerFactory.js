const APIQueryFeatures = require("../utils/apiQueryFeatures");
const catchAsyncError = require("../utils/catchAsyncError");
const CustomError = require("../utils/customError");

exports.deleteOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc)
      return next(new CustomError("No document found for the provided ID"));

    res.status(204).json({
      status: "success",
      data: null
    });
  });

exports.updateOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) next(new CustomError("No document found for the provided ID"));

    res.json({
      data: {
        data: doc
      }
    });
  });

exports.createOne = (Model) =>
  catchAsyncError(async (req, res) => {
    const doc = await Model.create(req.body);
    // .create can take array of multiple objects also

    /*  
  
      Alternative way
      const tour = new Tour({...data_here});
      const doc = await tour.save();
  
      */

    res.status(201).json({
      message: "Document added successfully!",
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, populateArr = []) =>
  catchAsyncError(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    // alternate
    // Tour.findOne({ _id: req.params.id })

    if (populateArr.length) {
      populateArr.forEach((str) => {
        query = query.populate(str);
      });
    }

    const doc = await query;

    if (!doc) {
      return next(new CustomError("Requested data not found!", 404));
    }

    res.json({
      data: {
        data: doc
      }
    });
  });

exports.getAll = (Model) =>
  catchAsyncError(async (req, res) => {
    // REFER TO docs/advanced-filtering.md FOR DOCUMENTATION

    // Build Query
    const features = new APIQueryFeatures(
      Model.find(req.getAllFilter || {}),
      req.query
    )
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
    const docs = await features.query;

    res.json({
      results: docs.length,
      data: {
        data: docs
      }
    });
  });
