// webpack.config.js
const path = require("path");

module.exports = {
  mode: "development",
  entry: "./public/js/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public/js/dist")
  }
};
