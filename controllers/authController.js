const { promisify } = require("util");
const crypto = require("crypto");

const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const catchAsyncError = require("../utils/catchAsyncError");
const CustomError = require("../utils/customError");
const sendEmail = require("../utils/email");

const getToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY
  });

exports.signup = catchAsyncError(async (req, res, next) => {
  const { email, name, photo, password, confirmPassword } = req.body;

  if (password !== confirmPassword)
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
  if (
    authHeader &&
    authHeader.startsWith("Bearer") &&
    authHeader.split(" ")[1]
  ) {
    // eslint-disable-next-line prefer-destructuring
    token = authHeader.split(" ")[1];
  } else next(new CustomError("Token not provided, please login again.", 401));

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

exports.restrictTo =
  (...roles) =>
  (req, _, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new CustomError("You are not authorised to perform this action", 403)
      );
    }

    next();
  };

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new CustomError("User not found.", 400));

  const resetToken = user.createResetPassToken();

  await user.save();

  try {
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    console.log({ new: resetUrl });

    await sendEmail({
      message: `Forgot your password? Please send a PATCH request on the following url: ${resetUrl}`,
      email: user.email,
      subject: "TravelTrail: Reset Password (Valid for 10 mins)"
    });

    res.status(200).json({
      status: "success",
      message: "Password Reset Email sent successfully"
    });
  } catch (error) {
    console.log(error.message);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    await user.save();
    next(
      new CustomError(
        "Error occured while sending email, please try again after some time.",
        500
      )
    );
  }
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const { code } = req.params;
  const { password, confirmPassword } = req.body;

  // 1. if not code or not passwords the throw error
  if (!code) {
    return next(
      new CustomError("Please use the correct url provided in mail.", 400)
    );
  }

  if (!password || confirmPassword !== password) {
    return next(
      new CustomError(
        "Password should be valid and should be equal to confirm password.",
        400
      )
    );
  }

  // 2. Get user based on the code
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken,
    passwordResetTokenExpiry: { $gt: Date.now() }
  });

  if (!user) return next(new CustomError("Token is invalid or expired", 400));

  user.password = password;
  user.passwordResetTokenExpiry = undefined;
  user.passwordResetToken = undefined;

  await user.save();

  // eslint-disable-next-line no-underscore-dangle
  const token = getToken(user._id);

  res.status(201).json({
    status: "success",
    message: "Password reset completed successfully.",
    token
  });
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  // 1. Get the user data from collection
  const {
    body: { password, newPassword, confirmNewPassword }
  } = req;

  if (!password || !newPassword || confirmNewPassword !== newPassword) {
    return next(
      new CustomError(
        "Invalid passwords or confirm password doesn't match the new password",
        400
      )
    );
  }

  // eslint-disable-next-line no-underscore-dangle
  const user = await User.findById(req.user._id).select("+password");
  // findOneAndUpdate wont work here because we want to fire the pre save middlewares also

  // 2. check if password if correct.
  const isPasswordCorrect = await user.isPasswordCorrect(
    password,
    user.password
  );

  if (!isPasswordCorrect)
    return next(new CustomError("Incorrect password.", 401));

  // 3. if so change the password
  user.password = newPassword;

  await user.save();

  // 4. Create new token and send it
  // eslint-disable-next-line no-underscore-dangle
  const token = getToken(user._id);

  res.json({
    message: "Password updated successfully",
    status: "success",
    token
  });
});
