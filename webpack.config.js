const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  devtool: "cheap-module-source-map",
  context: __dirname,
  performance: {
    hints: false
  },
  entry: "./demo.js",
  output: {
    filename: "[name].js"
  },
  resolve: {
    modules: ["node_modules", "."]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/
      }
    ]
  },
  devServer: {
    host: "0.0.0.0",
    port: 9000,
    disableHostCheck: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html"
    })
  ]
};
