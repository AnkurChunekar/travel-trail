const { promisify } = require("util");
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

exports.protect = catchAsyncError(async (req, res, next) => {
  // if(req.headers.Authorization)

  const authHeader = req.headers.authorization;
  let token = "";

  // 1. check for auth header
  if (authHeader.startsWith("Bearer") && authHeader.split(" ")[1]) {
    // eslint-disable-next-line prefer-destructuring
    token = authHeader.split(" ")[1];
  } else next(new CustomError("Session expired, please login.", 401));

  // 2. Verify the token.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. check if user still exists
  const user = await User.findById(decoded.id);

  if (!user) next(new CustomError("Session expired, please login.", 401));

  // 4. check if user changed the password after token was issued.
  if (user.passChangedAfterToken(decoded.iat))
    return next(
      new CustomError(
        "Password has been changed recently, please login again.",
        401
      )
    );

  req.user = user;
  next();
});
