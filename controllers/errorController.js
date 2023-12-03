/* eslint-disable no-param-reassign */

const CustomError = require("../utils/customError");

const handleErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    // API ERROR HANDLING
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err
    });
  } else {
    // VIEW ERROR HANDLING
    res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message
    });
  }
};

const handleErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    // API ERROR HANDLING
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    console.error("Error ", err);
    return res.status(500).json({
      message: "Something went very wrong!",
      status: "error",
      statusCode: 500
    });
  }

  // VIEW ERROR HANDLING
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message
    });
  }

  console.error("Error ", err);
  res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: "Please try again later."
  });
};

const handleKnownErrors = (error) => {
  if (error.kind === "ObjectId") {
    return new CustomError(
      `${error.stringValue} is not a valid ${error.path}`,
      400
    );
  }

  if (error.code === 11000) {
    let message = "";
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(error.keyValue)) {
      message += `'${value}' is an Invalid value for the ${key} property. \n`;
    }
    return new CustomError(message, 400);
  }

  if (
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError"
  ) {
    return new CustomError("Session expired, please login again.", 401);
  }

  return error;
};

module.exports = (err, req, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err, message: err.message };
  error = handleKnownErrors(error);

  if (process.env.NODE_ENV === "production") {
    handleErrorProd(error, req, res);
  } else handleErrorDev(error, req, res);

  next();
};
