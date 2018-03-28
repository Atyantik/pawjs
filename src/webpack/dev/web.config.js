const path = require("path");
const webpack = require("webpack");
const _ = require("lodash");

const directories = require("../utils/directories");
const pawConfig = require("../../config").env("development");

let configEnvVars = {};
_.each(pawConfig, (value, key) => {
  configEnvVars[`__config_${key}`] = value;
});

module.exports = {
  name: "web",
  mode: "development",
  context: directories.root,
  entry: {
    client: [
      "react-hot-loader/patch",
      "webpack-hot-middleware/client?name=web&path=/__hmr_update&timeout=2000&overlay=true",
      "./src/index.js",
    ],
  },
  output: {
    path: path.join(directories.dist, "build"),
    publicPath: "/build/",
    filename: "[hash].js",
    chunkFilename: "[chunkhash].js"
  },
  module: {
    rules: [
      require("../inc/babel-web-rule"),
      require("../inc/babel-css-rule"),
      // Managing fonts
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "fonts/",
              name: "[hash].[ext]",
              context: directories.src,
            }
          },
        ]
      },
      // Manage images
      {
        test: /\.(jpe?g|png|svg|gif|webp)$/i,
        // match one of the loader's main parameters (sizes and placeholder)
        resourceQuery: /[?&](sizes|placeholder)(=|&|\[|$)/i,
        use: "pwa-srcset-loader",
      },
      {
        test: /\.(jpe?g|png|gif|svg|webp)$/i,
        // match one of the loader's main parameters (sizes and placeholder)
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "images/",
              name: "[hash].[ext]",
              context: directories.src,
            }
          },
        ]
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: "all"
    }
  },
  target: "web",
  plugins: [
    new webpack.EnvironmentPlugin(Object.assign({}, {
      "__project_root": process.env.__project_root,
      "__lib_root": process.env.__lib_root,
    }, configEnvVars)),
    new webpack.HotModuleReplacementPlugin()
  ]
};
