// external imports
require("dotenv").config();

// internal imports
const initializeDbConnection = require("./db/db.connect");
const app = require("./app");

process.on("uncaughtException", (err) => {
  console.error("Global error", err.name, err.message);
  console.error("Unhandled exception, Shutting down 🔥");
  process.exit(1);
});

initializeDbConnection();

const server = app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Global error", err.name, err.message);
  console.error("Unhandled rejection, Shutting down 🔥");
  server.close(() => {
    process.exit(1);
  });
});
