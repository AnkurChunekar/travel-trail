// external imports
require("dotenv").config();

// internal imports
const initializeDbConnection = require("./db/db.connect");
const app = require("./app");

const PORT = 3000;

initializeDbConnection();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
