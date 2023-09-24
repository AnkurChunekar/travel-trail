const express = require("express");
const morgan = require("morgan");
const { rateLimit } = require("express-rate-limit");

const tourRouter = require("./routes/tourRoutes");
const CustomError = require("./utils/customError");
const userRouter = require("./routes/userRoutes");

const errorHandler = require("./controllers/errorController");

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (60 minutes),
  message: "Too many requests, please try again after an hour.",
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
  // store: ... , // Use an external store for more precise rate limiting
});

// 1) MIDDLEWARES
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api", limiter);
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log("Hello from the middleware 👋");
  next();
});

// 3) ROUTES
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(
    new CustomError(`Cannot find ${req.originalUrl} route on this url.`, 404)
  );
});

app.use(errorHandler);

module.exports = app;
