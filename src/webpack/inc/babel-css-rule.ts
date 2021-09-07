import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import assignIn from 'lodash/assignIn';
import directories from '../utils/directories';

const isProduction = process.env.PAW_ENV === 'production';

const defaultOptions = {
  sourceMap: !isProduction,
  localIdentName: isProduction ? '[hash:base64:5]' : '[path][name]__[local]',
  compress: isProduction,
  hot: false,
};

export default (options: any = {}) => {
  const o = assignIn({}, defaultOptions, options);
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
            modules: {
              localIdentName: o.localIdentName,
            },
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
            modules: {
              localIdentName: '[local]',
            },
            sourceMap: o.sourceMap,
            importLoaders: 2,
          },
        },
      ],
    },
  ];
};
