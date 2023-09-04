const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
// const userRouter = require("./routes/userRoutes");

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
// app.use("/api/v1/users", userRouter);

app.all("*", (req, res) => {
  res.status(404).json({
    status: "failure",
    message: `Cannot find ${req.originalUrl} route on this url.`
  });
});

module.exports = app;
