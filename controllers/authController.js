const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const catchAsyncError = require("../utils/catchAsyncError");
const CustomError = require("../utils/customError");

const getToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY
  });

exports.signup = catchAsyncError(async (req, res, next) => {
  const { email, name, photo, password, passwordConfirm } = req.body;

  if (password !== passwordConfirm)
    return next(
      new CustomError("Password and confirm password should be same", 400)
    );

  const user = await User.create({ email, name, photo, password });
  // eslint-disable-next-line no-underscore-dangle
  const token = getToken(user._id);

  res.status(201).json({
    status: "success",
    token,
    data: { name: user.name, email: user.email, photo: user.photo }
  });
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const genericErr = new CustomError("Email or Password is incorrect", 401);

  // if email or password not sent in body
  if (!email || !password) return next(genericErr);

  const user = await User.findOne({ email }).select("_id email password");

  // if user is not present in DB
  if (!user) return next(genericErr);

  // check if valid password
  const match = await user.isPasswordCorrect(password, user.password);

  if (!match) return next(genericErr);

  // eslint-disable-next-line no-underscore-dangle
  const token = getToken(user._id);

  res.status(200).json({ status: "success", token });
});
