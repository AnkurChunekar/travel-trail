const path = require("path");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const tourRouter = require("./routes/tourRoutes");
const CustomError = require("./utils/customError");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");

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

// SERVE STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

//  SETTING VIEW ENGINE & DIRECTORY
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//  SECURITY HTTP HEADERS
app.use(helmet({ contentSecurityPolicy: false }));

// LOGGER
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// RATE LIMITING
app.use("/api", limiter);

// BODY & Cookie PARSERS
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// CUSTOM EXAMPLE
app.use((req, res, next) => {
  console.log("Hello from the middleware 👋");
  next();
});

// 3) ROUTES
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  next(
    new CustomError(`Cannot find ${req.originalUrl} route on this url.`, 404)
  );
});

app.use(errorHandler);

module.exports = app;
