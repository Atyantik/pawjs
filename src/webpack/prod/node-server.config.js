const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require("webpack");
const _ = require("lodash");

const SyncedFilesPlugin = require("../plugins/synced-files-plugin");
const directories = require("../utils/directories");

const pawConfig = require("../../config").env("production");

let configEnvVars = {};
_.each(pawConfig, (value, key) => {
  configEnvVars[`__config_${key}`] = value;
});

// Get server rule for no Chunking
let serverRule = Object.assign({}, require("../inc/babel-server-rule"));
serverRule.use.options.plugins = require("../inc/babel-plugins")({noChunk: true});

// Get CSS rule without style-loader as we we need to extract it
let cssUseRules = [].concat(require("../inc/babel-prod-css-rule").use);
cssUseRules.shift();

module.exports = {
  mode: "production",
  entry: path.resolve(process.env.__lib_root, "./src/server/prod.js"),
  context: directories.root,
  module: {
    rules: [
      serverRule,
      {
        test: /\.(sass|scss|css)$/,
        use: ExtractTextPlugin.extract({
          use: cssUseRules
        })
      },
      // Managing fonts
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              emitFile: false,
              outputPath: "build/fonts/",
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
              outputPath: "build/images/",
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
  target: "node",
  performance: false,
  optimization: {
    splitChunks: false
  },
  stats: {
    warnings: false
  },
  output: {
    path: directories.dist,
    filename: "server.js",
    publicPath: "/",
    library: "dev-server",
    libraryTarget: "umd"
  },
  externals: {
    "pwa-assets": "./assets.json",
  },
  plugins: [
    new webpack.EnvironmentPlugin(Object.assign({}, {
      "__project_root": process.env.__project_root,
      "__lib_root": process.env.__lib_root,
    }, configEnvVars)),
    new ExtractTextPlugin({
      filename: "server.css",
      allChunks: true
    }),
    new SyncedFilesPlugin({
      deleteAfterCompile: true,
      outputPath: directories.dist
    })
  ]
};
