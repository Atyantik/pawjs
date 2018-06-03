const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const _ = require("lodash");



let serverRule = require("../inc/babel-server-rule");
serverRule.use.options.plugins = require("../inc/babel-plugins")({noChunk: true});

let cssUseRules = [].concat(require("../inc/babel-css-rule").use);
cssUseRules.shift();

const directories = require("../utils/directories");
const pawConfig = require("../../config");

let configEnvVars = {};
_.each(pawConfig, (value, key) => {
  configEnvVars[`__config_${key}`] = value;
});

module.exports = {
  mode: "development",
  entry: path.resolve(process.env.__lib_root,"./src/server/common.js"),
  module: {
    rules: [
      serverRule,
      {
        test: /\.(sass|scss|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          ...cssUseRules
        ]
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,

        use: [
          {
            loader: "file-loader",
            options: {
              emitFile: false,
              outputPath: "build/images/",
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
              emitFile: false,
              outputPath: "build/images/",
              name: "[hash].[ext]",
              context: directories.src,
            }
          },
        ]
      },
    ]
  },
  context: directories.root,
  externals: {
    express: "express"
  },
  target: "node",
  devServer: {
    port: pawConfig.port,
    host: pawConfig.host,
    serverSideRender: pawConfig.serverSideRender,
  },
  optimization: {
    splitChunks: false
  },
  output: {
    filename: "server.js",
    publicPath: "/",
    path: directories.dist,
    library: "dev-server",
    libraryTarget: "umd"
  },
  resolve: {
    modules: [
      path.resolve(directories.root, "node_modules"),
      path.resolve(process.env.__lib_root, "node_modules"),
    ]
  },
  resolveLoader: {
    modules: [
      path.resolve(path.join(directories.root, "node_modules")),
      path.resolve(path.join(process.env.__lib_root, "node_modules")),
      path.resolve(path.join(process.env.__lib_root, "src", "webpack", "loaders"))
    ]
  },
  plugins: [
    new webpack.EnvironmentPlugin(Object.assign({}, {
      "__project_root": process.env.__project_root,
      "__lib_root": process.env.__lib_root,
    }, configEnvVars)),

    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "server.css",
    })
  ]
};
