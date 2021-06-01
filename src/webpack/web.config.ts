import path from 'path';
import WorkboxPlugin from 'workbox-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack, { WebpackPluginInstance } from 'webpack';
import fs from 'fs';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import cssRule from './inc/babel-css-rule';
import imageRule from './inc/babel-image-rule';
import SwVariables from './plugins/sw-variables';
import directories from './utils/directories';
import webRule from './inc/babel-web-rule';
import resolverConfig from './inc/webpack-resolver-config';
import pawConfig from '../config';
import fontRule from './inc/babel-font-rule';
import { pawExistsSync } from '../globals';

let projectSW = '';
if (pawExistsSync(path.join(directories.src, 'sw'))) {
  projectSW = fs.readFileSync(pawExistsSync(path.join(directories.src, 'sw')), 'utf-8');
}

const isHot = typeof process.env.PAW_HOT !== 'undefined' ? process.env.PAW_HOT === 'true' : pawConfig.hotReload;

const devPlugins: WebpackPluginInstance [] = [];
if (process.env.PAW_DEBUG === 'true') {
  devPlugins.push(new BundleAnalyzerPlugin());
}

export default {
  name: 'web',
  target: 'web',
  mode: process.env.PAW_ENV !== 'production' ? 'development' : 'production',
  context: directories.root,
  entry: {
    client: [
      // ...(pawConfig.polyfill === 'cdn' ? [] : ['core-js/stable', 'regenerator-runtime/runtime']),
      // Initial entry point for dev
      pawExistsSync(path.join(process.env.LIB_ROOT || '', './src/client/app')),
    ],
  },
  output: {
    path: directories.build,
    publicPath: pawConfig.resourcesBaseUrl,
    filename: 'js/[contenthash].js',
    chunkFilename: 'js/[chunkhash].js',
  },
  stats: true,
  module: {
    rules: [
      webRule({ hot: isHot }),
      ...cssRule({ hot: isHot }),
      fontRule({
        outputPath: 'fonts/',
        publicPath: `${pawConfig.resourcesBaseUrl}fonts/`,
      }),
      imageRule({
        outputPath: 'images/',
        publicPath: `${pawConfig.resourcesBaseUrl}images/`,
        name: '[contenthash]-[name].[ext]',
        context: directories.src,
      }),
    ],
  },
  ...resolverConfig,
  // optimization: {
  //   splitChunks: {
  //     chunks: 'all',
  //   },
  // },
  externals: {
    ...(pawConfig.react === 'cdn' ? { react: 'React', 'react-dom': 'ReactDOM' } : {}),
  },
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
    ...(isHot ? [] : [new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'css/[contenthash].css',
      chunkFilename: 'css/[chunkhash].css',
      ignoreOrder: true,
    })]),
    ...(pawConfig.serviceWorker ? [
      new WorkboxPlugin.InjectManifest({
        swSrc: pawExistsSync(path.join(process.env.LIB_ROOT || '', 'src', 'service-worker')),
        swDest: 'sw.js',
      }),
      new SwVariables({
        fileName: 'sw.js',
        variables: { workboxDebug: true, ...pawConfig },
      }),
    ] : []),
    ...devPlugins,
  ],
};
