const User = require("../models/userModel");
const catchAsyncError = require("../utils/catchAsyncError");
const CustomError = require("../utils/customError");
const factory = require("./handlerFactory");

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

  res.status(200).json({
    status: "success",
    data: { user }
  });
});

exports.deleteMe = catchAsyncError(async (req, res) => {
  // eslint-disable-next-line no-underscore-dangle
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: "success",
    message: "User deleted successfully"
  });
});

exports.getAllUsers = catchAsyncError(async (_, res) => {
  const users = await User.find({});

  res.json({
    results: users.length,
    data: {
      users
    }
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = factory.getOne(User);
