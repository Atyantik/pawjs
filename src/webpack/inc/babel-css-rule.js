const path = require("path");
const directories = require("../utils/directories");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const _ = require("lodash");

const defaultOptions = {
  sourceMap: true,
  localIdentName: "[path][name]__[local]",
  compress: false,
};

module.exports = module.exports.default = (options) => {
  const o = _.assignIn({}, defaultOptions, options);
  return [
    {
      test: /\.(sass|scss|css)$/,
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
        },
        {
          loader: "postcss-loader",
          options: {
            sourceMap: o.sourceMap,
            ident: "postcss",
            plugins: () => [
              require("postcss-preset-env")()
            ]
          }
        },
        {
          loader: "sass-loader",
          options: {
            outputStyle: o.compress ? "compressed": "expanded",
            sourceMap: o.sourceMap,
            sourceMapContents: o.sourceMap,
          }
        }
      ]
    },
    {
      test: /\.(sass|scss|css)$/,
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
        {
          loader: "postcss-loader",
          options: {
            sourceMap: o.sourceMap,
            ident: "postcss",
            plugins: () => [
              require("postcss-preset-env")()
            ]
          }
        },
        {
          loader: "sass-loader",
          options: {
            outputStyle: o.compress ? "compressed": "expanded",
            sourceMap: o.sourceMap,
            sourceMapContents: o.sourceMap,
          }
        }
      ]
    },
  ];
};
