// external imports
require("dotenv").config();

// internal imports
const initializeDbConnection = require("./db/db.connect");
const app = require("./app");

const PORT = 3000;

process.on("uncaughtException", (err) => {
  console.error("Global error", err.name, err.message);
  console.error("Unhandled exception, Shutting down 🔥");
  process.exit(1);
});

initializeDbConnection();

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Global error", err.name, err.message);
  console.error("Unhandled rejection, Shutting down 🔥");
  server.close(() => {
    process.exit(1);
  });
});
