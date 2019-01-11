import path from 'path';
import WorkboxPlugin from 'workbox-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';
import fs from 'fs';
import cssRule from './inc/babel-css-rule';
import imageRule from './inc/babel-image-rule';
import SwVariables from './plugins/sw-variables';
import directories from './utils/directories';
import webRule from './inc/babel-web-rule';
import resolverConfig from './inc/webpack-resolver-config';
import pawConfig from '../config';
import fontRule from './inc/babel-font-rule';

let projectSW = '';
if (fs.existsSync(path.join(directories.src, 'sw.js'))) {
  projectSW = fs.readFileSync(path.join(directories.src, 'sw.js'), 'utf-8');
}

const isHot = typeof process.env.PAW_HOT !== 'undefined' ? process.env.PAW_HOT === 'true' : false;

const devPlugins = [];
// try {
//   if (require.resolve('webpack-bundle-analyzer')) {
//     const WebpackBundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
//     devPlugins.push(new WebpackBundleAnalyzer());
//   }
// } catch (e) {
//   // eslint-disable-next-line
//   console.warn("Webpack bundle analyzer not found!");
// }


export default {
  name: 'web',
  target: 'web',
  mode: process.env.PAW_ENV !== 'production' ? 'development' : 'production',
  context: directories.root,
  entry: {
    client: [
      ...(pawConfig.polyfill === 'cdn' ? [] : ['@babel/polyfill']),
      // Initial entry point for dev
      path.resolve(process.env.LIB_ROOT, './src/client/app.js'),
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
        name: '[hash].[ext]',
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
    new webpack.EnvironmentPlugin(Object.assign({}, process.env)),
    ...(isHot ? [] : [new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'css/[hash].css',
      chunkFilename: 'css/[chunkhash].css',
    })]),
    ...(pawConfig.serviceWorker ? [
      new WorkboxPlugin.InjectManifest({
        swSrc: path.resolve(process.env.LIB_ROOT, 'src', 'service-worker.js'),
        swDest: 'sw.js',
      }),
      new SwVariables({
        fileName: 'sw.js',
        variables: Object.assign({ workboxDebug: true }, pawConfig),
        text: projectSW,
      }),
    ] : []),
    ...devPlugins,
  ],
};
