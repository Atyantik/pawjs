/* global pawExistsSync */
import path from 'path';
import WorkboxPlugin from 'workbox-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';
import fs from 'fs';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import cssRule from './inc/babel-css-rule';
import imageRule from './inc/babel-image-rule';
import SwVariables from './plugins/sw-variables';
import directories from './utils/directories';
// @ts-ignore
import webRule from './inc/babel-web-rule';
// @ts-ignore
import resolverConfig from './inc/webpack-resolver-config';
import pawConfig from '../config';
// @ts-ignore
import fontRule from './inc/babel-font-rule';

let projectSW = '';
if (pawExistsSync(path.join(directories.src, 'sw'))) {
  projectSW = fs.readFileSync(pawExistsSync(path.join(directories.src, 'sw')), 'utf-8');
}

const isHot = typeof process.env.PAW_HOT !== 'undefined' ? process.env.PAW_HOT === 'true' : false;

const devPlugins: webpack.Plugin [] = [];
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
      ...(pawConfig.polyfill === 'cdn' ? [] : ['@babel/polyfill']),
      // Initial entry point for dev
      pawExistsSync(path.join(process.env.LIB_ROOT || '', './src/client/app')),
    ],
  },
  output: {
    path: directories.build,
    publicPath: pawConfig.resourcesBaseUrl,
    filename: 'js/[hash].js',
    chunkFilename: 'js/[chunkhash].js',
  },
  stats: true,
  module: {
    rules: [
      webRule(),
      ...cssRule({ hot: isHot }),
      fontRule({
        outputPath: 'fonts/',
        publicPath: `${pawConfig.resourcesBaseUrl}fonts/`,
      }),
      imageRule({
        outputPath: 'images/',
        publicPath: `${pawConfig.resourcesBaseUrl}images/`,
        name: '[hash]-[name].[ext]',
        context: directories.src,
      }),
    ],
  },
  ...resolverConfig,
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  externals: {
    ...(pawConfig.react === 'cdn' ? { react: 'React', 'react-dom': 'ReactDOM' } : {}),
  },
  plugins: [
    ...(pawConfig.react === 'cdn' ? [
      new webpack.ProvidePlugin({
        React: 'React',
        react: 'React',
        'window.react': 'React',
        'window.React': 'React',
        ReactDom: 'ReactDOM',
        ReactDOM: 'ReactDOM',
        'window.ReactDOM': 'ReactDOM',
        'window.ReactDom': 'ReactDOM',
      }),
    ] : []),
    new webpack.EnvironmentPlugin({ pawConfig: JSON.stringify(pawConfig), ...process.env }),
    ...(isHot ? [] : [new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'css/[hash].css',
      chunkFilename: 'css/[chunkhash].css',
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
