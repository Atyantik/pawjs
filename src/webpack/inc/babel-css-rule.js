const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const _ = require('lodash');
const directories = require('../utils/directories');

const isProduction = process.env.PAW_ENV === 'production';

const defaultOptions = {
  sourceMap: !isProduction,
  localIdentName: isProduction ? '[hash:base64:5]' : '[path][name]__[local]',
  compress: isProduction,
  hot: false,
};

const rule = (options) => {
  const o = _.assignIn({}, defaultOptions, options);
  return [
    {
      test: /\.css$/,
      exclude: [
        path.join(directories.src, 'resources'),
        path.join(directories.root, 'node_modules'),
      ],
      use: [
        {
          loader: o.hot ? 'style-loader' : MiniCssExtractPlugin.loader,
        },
        {
          loader: 'css-loader',
          options: {
            modules: true,
            localIdentName: o.localIdentName,
            sourceMap: o.sourceMap,
            importLoaders: 1,
          },
        },
      ],
    },
    {
      test: /\.css$/,
      include: [
        path.join(directories.src, 'resources'),
        path.join(directories.root, 'node_modules'),
      ],
      use: [
        {
          loader: o.hot ? 'style-loader' : MiniCssExtractPlugin.loader,
        },
        {
          loader: 'css-loader',
          options: {
            modules: true,
            localIdentName: '[local]',
            sourceMap: o.sourceMap,
            importLoaders: 2,
          },
        },
      ],
    },
  ];
};

module.exports = rule;
