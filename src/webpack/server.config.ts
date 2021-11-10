import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';
import cssRule from './inc/babel-css-rule';
import imageRule from './inc/babel-image-rule';
import assetsRule from './inc/babel-assets-rule';
import directories from './utils/directories';
import pawConfig from '../config';
import resolverConfig from './inc/webpack-resolver-config';
import serverRule from './inc/babel-server-rule';
import fontRule from './inc/babel-font-rule';
import { pawExistsSync } from '../globals';

const isProduction = process.env.PAW_ENV === 'production';

export default {
  name: 'server',
  mode: isProduction ? 'production' : 'development',
  target: 'node',
  entry: pawExistsSync(path.join(process.env.LIB_ROOT || '', './src/server/server')),
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
      },
      assetsRule({
        outputPath: 'build/assets/',
      }),
      {
        resourceQuery: /raw/,
        type: 'asset/source',
      },
      serverRule({ hot: false, noChunk: true, cacheDirectory: process.env.PAW_CACHE === 'true' }),
      ...cssRule(),
      imageRule({
        outputPath: 'build/images/',
      }),
    ],
  },
  context: directories.root,
  optimization: {
    splitChunks: false,
  },
  output: {
    filename: 'server.js',
    publicPath: pawConfig.resourcesBaseUrl,
    path: directories.dist,
    library: 'dev-server',
    libraryTarget: 'umd',
  },
  stats: true,
  externals: {
    'pwa-assets': './assets.json',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  ...resolverConfig,
  plugins: [
    new webpack.EnvironmentPlugin({ pawConfig: JSON.stringify(pawConfig), ...process.env }),
    new MiniCssExtractPlugin({ filename: 'server.css' }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
  ignoreWarnings: [
    (warning: any) => {
      let message = '';
      if (typeof warning === 'string') {
        message = warning;
      }
      if (warning && typeof warning.message === 'string') {
        message = warning.message;
      }
      return !(
        message.indexOf('node_modules/express') !== -1
          || message.indexOf('node_modules/encoding') !== -1
          || message.indexOf('config/index') !== -1
      );
    },
  ],
};
