const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const catchAsyncError = require("../utils/catchAsyncError");
const CustomError = require("../utils/customError");
const Email = require("../utils/email");

const sendResWithToken = ({ res, user, jsonData = {}, statusCode = 200 }) => {
  // eslint-disable-next-line no-underscore-dangle
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIE_EXPIRY) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", `Bearer ${token}`, cookieOptions);

  res.status(statusCode).json({ ...jsonData, token, status: "success" });
};

exports.signup = catchAsyncError(async (req, res, next) => {
  const { email, name, photo, password, confirmPassword } = req.body;

  if (password !== confirmPassword)
    return next(
      new CustomError("Password and confirm password should be same", 400)
    );

  const user = await User.create({ email, name, photo, password });

  const url = `${req.protocol}://${req.get("host")}/me`;
  await new Email(user, url).sendWelcome();

  sendResWithToken({
    statusCode: 201,
    jsonData: {
      data: { name: user.name, email: user.email, photo: user.photo }
    },
    user,
    res
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

  sendResWithToken({
    jsonData: { message: "Logged in Successfully" },
    user,
    res
  });
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
  } else if (req.cookies.jwt) {
    // eslint-disable-next-line prefer-destructuring
    token = req.cookies.jwt.split(" ")[1];
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
  res.locals.user = user;
  next();
});

exports.isViewClientLoggedIn = async (req, res, next) => {
  try {
    const jwtCookie = req.cookies.jwt;
    let token = "";

    if (jwtCookie) {
      // 1. check for auth header
      if (
        jwtCookie &&
        jwtCookie.startsWith("Bearer") &&
        jwtCookie.split(" ")[1]
      ) {
        // eslint-disable-next-line prefer-destructuring
        token = jwtCookie.split(" ")[1];
      } else return next();

      // 2. Verify the token.
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      // 3. check if user still exists
      const user = await User.findById(decoded.id);

      if (!user) return next();

      // 4. check if user changed the password after token was issued.
      if (user.passChangedAfterToken(decoded.iat)) return next();

      // mutating the locals property passes the variable to the susequent (pug) template where we can access it.
      res.locals.user = user;
    }
  } catch (error) {
    console.log(error);
  }
  next();
};

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

    await new Email(user, resetUrl).sendPasswordReset();

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

  sendResWithToken({
    jsonData: { message: "Password reset completed successfully." },
    user,
    res
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

  sendResWithToken({
    jsonData: { message: "Password updated successfully." },
    user,
    res
  });
});

exports.logout = catchAsyncError(async (_, res) => {
  res.cookie("jwt", "logout", {
    httpOnly: true
  });

  res
    .status(200)
    .json({ message: "User logged out successfully", status: "success" });
});
