import path from 'path';
import WorkboxPlugin from 'workbox-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import cssRule from './inc/babel-css-rule';
import imageRule from './inc/babel-image-rule';
import assetsRule from './inc/babel-assets-rule';
import SwVariables from './plugins/sw-variables';
import directories from './utils/directories';
import webRule from './inc/babel-web-rule';
import resolverConfig from './inc/webpack-resolver-config';
import pawConfig from '../config';
import { pawExistsSync } from '../globals';

const isStartCmd = process.env.PAW_START_CMD === 'true';
const isProductionMode = process.env.PAW_ENV === 'production';
const isHot = !isProductionMode && isStartCmd && process.env.PAW_HOT === 'true';
const isDebugEnabled = process.env.PAW_DEBUG === 'true';

const webConfig: webpack.Configuration = {
  stats: true,
  name: 'web',
  target: 'web',
  mode: isProductionMode ? 'production' : 'development',
  devtool: isProductionMode ? 'source-map' : 'eval-source-map',
  context: directories.root,
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 100000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 20,
      maxInitialRequests: 20,
      enforceSizeThreshold: 120000,
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          reuseExistingChunk: true,
        },
        corejs: {
          test: /[\\/]node_modules[\\/](corejs|core-js)[\\/]/,
          name: 'corejs',
          chunks: 'all',
          reuseExistingChunk: true,
        },
        reactRouter: {
          test: /[\\/]node_modules[\\/](react-router|react-router-dom)[\\/]/,
          name: 'react-router',
          chunks: 'all',
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 1,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  entry: {
    client: [
      isHot && 'webpack-hot-middleware/client?name=web&path=/__hmr_update&timeout=2000&overlay=true&quiet=false',
      isHot && 'react-refresh/runtime',
      // Initial entry point for dev
      pawExistsSync(path.join(process.env.LIB_ROOT || '', './src/client/app')),
    ].filter(Boolean),
  },
  output: {
    path: directories.build,
    publicPath: pawConfig.resourcesBaseUrl,
    filename: 'js/[contenthash].js',
    chunkFilename: 'js/[chunkhash].js',
    assetModuleFilename: 'assets/[contenthash]-[name][ext][query]',
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
      },
      assetsRule(),
      {
        resourceQuery: /raw/,
        type: 'asset/source',
      },
      webRule(),
      ...cssRule({ hot: isHot }),
      imageRule(),
    ],
  },
  ...resolverConfig,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {},
      'process.env.NODE_ENV': JSON.stringify(process.env?.PAW_ENV ?? 'development'),
    }),
    new webpack.EnvironmentPlugin({
      APP_DESCRIPTION: null,
      APP_NAME: null,
      ENABLE_KEYWORDS: null,
      PAGE_TITLE_SEPARATOR: null,
      pawConfig: JSON.stringify(pawConfig),
      ...process.env,
    }),
    !isStartCmd && new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'css/[contenthash].css',
      chunkFilename: 'css/[chunkhash].css',
    }),
    pawConfig.serviceWorker && new WorkboxPlugin.InjectManifest({
      swSrc: pawExistsSync(path.join(process.env.LIB_ROOT || '', 'src', 'service-worker')),
      swDest: 'sw.js',
    }),
    pawConfig.serviceWorker && new SwVariables({
      fileName: 'sw.js',
      variables: { workboxDebug: true, ...pawConfig },
    }),
    isDebugEnabled && new BundleAnalyzerPlugin(),
    isHot && new ReactRefreshWebpackPlugin(),
    isHot && new webpack.HotModuleReplacementPlugin(),
  ].filter(Boolean),
};

export default webConfig;
