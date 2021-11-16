import path from 'path';
import WorkboxPlugin from 'workbox-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack, { WebpackPluginInstance } from 'webpack';
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

const isHot = typeof process.env.PAW_HOT !== 'undefined' ? process.env.PAW_HOT === 'true' : pawConfig.hotReload;

const devPlugins: WebpackPluginInstance[] = [];
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
      ...(isHot ? ['react-refresh/runtime'] : []),
      // Initial entry point for dev
      pawExistsSync(path.join(process.env.LIB_ROOT || '', './src/client/app')),
    ],
  },
  output: {
    path: directories.build,
    publicPath: pawConfig.resourcesBaseUrl,
    filename: 'js/[contenthash].js',
    chunkFilename: 'js/[chunkhash].js',
    assetModuleFilename: 'assets/[contenthash]-[name][ext][query]',
  },
  stats: true,
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
      },
      assetsRule({
        outputPath: 'assets/',
      }),
      {
        resourceQuery: /raw/,
        type: 'asset/source',
      },
      webRule({ hot: isHot }),
      ...cssRule({ hot: isHot }),
      imageRule({
        outputPath: 'images/',
      }),
    ],
  },
  ...resolverConfig,
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
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'css/[contenthash].css',
      chunkFilename: 'css/[chunkhash].css',
    }),
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
