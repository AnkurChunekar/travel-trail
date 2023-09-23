const User = require("../models/userModel");
const catchAsyncError = require("../utils/catchAsyncError");
const CustomError = require("../utils/customError");

exports.updateMe = catchAsyncError(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword)
    return next(
      new CustomError(
        "This route cannot be used for password updates, please use /updatePassword.",
        400
      )
    );

  const { email, name } = req.body;
  const user = await User.findByIdAndUpdate(
    // eslint-disable-next-line no-underscore-dangle
    req.user._id,
    {
      email,
      name
    },
    { runValidators: true, new: true }
  );

  res.status(201).json({
    status: "success",
    data: { user }
  });
});
