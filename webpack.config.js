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
      },
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          {
            loader: "postcss-loader",
            options: {
              plugins: [
                require("autoprefixer"),
                require("postcss-flexbugs-fixes")
              ]
            }
          }
        ]
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
      template: "demo.html"
    })
  ]
};
