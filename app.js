const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const CustomError = require("./utils/customError");
const userRouter = require("./routes/userRoutes");

const errorHandler = require("./controllers/errorController");

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

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
