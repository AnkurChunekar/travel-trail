class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // status = fail if code = 4xx else error if 5xx
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    // this avoids the customError class to be added in stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CustomError;
