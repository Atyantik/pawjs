const mode = "production";
const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const webpack = require("webpack");
const _ = require("lodash");

const ExtractEmittedAssets = require("../plugins/extract-emitted-assets");
const directories = require("../utils/directories");
const pawConfig = require("../../config").env(mode);
const SyncedFilesPlugin = require("../plugins/synced-files-plugin");

let configEnvVars = {};
_.each(pawConfig, (value, key) => {
  configEnvVars[`__config_${key}`] = value;
});

module.exports = {
  name: "web",
  mode,
  context: directories.root,
  entry: {
    client: [
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
      require("../inc/babel-prod-css-rule"),
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
          }
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
        use: SyncedFilesPlugin.loader([
          {
            loader: "file-loader",
            options: {
              outputPath: "images/",
              name: "[hash].[ext]",
              context: directories.src,
            }
          },
          {
            loader: "image-webpack-loader",
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65
              },
              // optipng.enabled: false will disable optipng
              optipng: {
                enabled: true,
                optimizationLevel: 7
              },
              pngquant: {
                quality: "65-90",
                speed: 1
              },
              gifsicle: {
                interlaced: false,
              },
              // the webp option will enable WEBP
              webp: {
                quality: 75
              }
            }
          }
        ])
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
    new CleanWebpackPlugin([
      directories.dist.split(path.sep).pop(),
    ], {
      root: path.dirname(directories.dist),
    }),
    new ExtractEmittedAssets({
      outputPath: directories.dist
    }),
    new SyncedFilesPlugin({
      outputPath: directories.dist
    })
  ],
};
