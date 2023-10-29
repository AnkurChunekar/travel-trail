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
