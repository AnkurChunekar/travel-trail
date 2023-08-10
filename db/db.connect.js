const mongoose = require("mongoose");

const initializeDbConnection = async () => {
  try {
    const { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;
    await mongoose.connect(
      `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true
      }
    );
    console.log("Successfully connected to DB!");
  } catch (error) {
    console.log("Error occured while connecting to DB!");
    console.log(error.message);

    // stop the process. 0 means end the process without any kind of failure and 1 means end the process with some failure
    process.exit(1);
  }
};

module.exports = initializeDbConnection;
