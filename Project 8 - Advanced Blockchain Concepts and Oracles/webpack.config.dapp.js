const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: "./src/dapp/index.js",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: "./src/dapp/index.html",
      to: "index.html"
    }]),
    new CopyWebpackPlugin([{
      from: "./src/dapp/styles.css",
      to: "styles.css"
    }]),
    new CopyWebpackPlugin([{
      from: "./src/dapp/flight.jpg",
      to: "flight.jpg"
    }]),
    new CopyWebpackPlugin([{
      from: "./src/dapp/config.json",
      to: "config.json"
    }]),
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 8000,
    compress: true
  },
};