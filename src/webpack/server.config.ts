/* global pawExistsSync */
import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';
import cssRule from './inc/babel-css-rule';
import imageRule from './inc/babel-image-rule';
import directories from './utils/directories';
import pawConfig from '../config';
// @ts-ignore
import resolverConfig from './inc/webpack-resolver-config';
// @ts-ignore
import serverRule from './inc/babel-server-rule';
// @ts-ignore
import fontRule from './inc/babel-font-rule';

const isProduction = process.env.PAW_ENV === 'production';

export default {
  name: 'server',
  mode: isProduction ? 'production' : 'development',
  target: 'node',
  entry: pawExistsSync(path.join(process.env.LIB_ROOT || '', './src/server/server')),
  module: {
    rules: [
      serverRule({ hot: false, noChunk: true, cacheDirectory: process.env.PAW_CACHE === 'true' }),
      ...cssRule(),
      fontRule({
        emitFile: false,
        outputPath: 'build/fonts/',
        publicPath: `${pawConfig.resourcesBaseUrl}fonts/`,
      }),
      imageRule({
        outputPath: 'build/images/',
        publicPath: `${pawConfig.resourcesBaseUrl}images/`,
        name: '[hash]-[name].[ext]',
        context: directories.src,
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
};
