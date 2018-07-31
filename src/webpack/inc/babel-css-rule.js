const path = require("path");
const directories = require("../utils/directories");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const _ = require("lodash");
const isProduction = process.env.PAW_ENV === "production";

const defaultOptions = {
  sourceMap: !isProduction,
  localIdentName: isProduction? "[hash:base64:5]": "[path][name]__[local]",
  compress: isProduction,
};

module.exports = module.exports.default = (options) => {
  const o = _.assignIn({}, defaultOptions, options);
  return [
    {
      test: /\.css$/,
      exclude: [
        path.join(directories.src, "resources"),
        path.join(directories.root, "node_modules"),
      ],
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: "css-loader",
          options: {
            modules: true,
            localIdentName: o.localIdentName,
            sourceMap: o.sourceMap,
            minimize: o.compress,
            importLoaders: 2
          }
        }
      ]
    },
    {
      test: /\.css$/,
      include: [
        path.join(directories.src, "resources"),
        path.join(directories.root, "node_modules"),
      ],
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: "css-loader",
          options: {
            modules: true,
            localIdentName: "[local]",
            sourceMap: o.sourceMap,
            minimize: o.compress,
            importLoaders: 2
          }
        },
      ]
    },
  ];
};
