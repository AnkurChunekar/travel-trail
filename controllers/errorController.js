/* eslint-disable no-param-reassign */

const CustomError = require("../utils/customError");

const handleErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err
  });
};

const handleErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.error("Error ", err);
    res.status(500).json({
      message: "Something went very wrong!",
      status: "error",
      statusCode: 500
    });
  }
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

  return error;
};

module.exports = (err, _, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err, message: err.message };
  error = handleKnownErrors(error);

  if (process.env.NODE_ENV === "production") {
    handleErrorProd(error, res);
  } else handleErrorDev(error, res);

  next();
};
