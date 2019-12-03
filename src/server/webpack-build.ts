/* global pawExistsSync */
import path from 'path';
import fs from 'fs';
import del from 'del';
import mv from 'mv';
import request from 'supertest';
import webpack, { RuleSetRule } from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import pawConfig from '../config';
import directories from '../webpack/utils/directories';
import wHandler from '../webpack';
// @ts-ignore
import webRule from '../webpack/inc/babel-web-rule';
// @ts-ignore
import serverRule from '../webpack/inc/babel-server-rule';
// @ts-ignore
import SyncedFilesPlugin from '../webpack/plugins/synced-files-plugin';
// @ts-ignore
import ExtractEmittedAssets from '../webpack/plugins/extract-emitted-assets';

const isVerbose = process.env.PAW_VERBOSE === 'true';

const stats: webpack.Stats.ToStringOptionsObject = {
  // fallback value for stats options when
  // an option is not defined (has precedence over local webpack defaults)
  all: undefined,

  // Add asset Information
  assets: true,

  // Sort assets by a field
  // You can reverse the sort with `!field`.
  assetsSort: 'field',

  // Add build date and time information
  builtAt: true,

  // Add information about cached (not built) modules
  cached: isVerbose,

  // Show cached assets (setting this to `false` only shows emitted files)
  cachedAssets: isVerbose,

  // Add children information
  children: true,

  // Add chunk information (setting this to `false` allows for a less verbose output)
  chunks: isVerbose,

  // Add built modules information to chunk information
  chunkModules: isVerbose,

  // Add the origins of chunks and chunk merging info
  chunkOrigins: isVerbose,

  // Sort the chunks by a field
  // You can reverse the sort with `!field`. Default is `id`.
  chunksSort: 'field',

  // Context directory for request shortening
  context: directories.src,

  // `webpack --colors` equivalent
  colors: true,

  // Display the distance from the entry point for each module
  depth: isVerbose,

  // Display the entry points with the corresponding bundles
  entrypoints: isVerbose,

  // Add --env information
  env: true,

  // Add errors
  errors: true,

  // Add details to errors (like resolving log)
  errorDetails: true,

  // Add the hash of the compilation
  hash: true,

  // Set the maximum number of modules to be shown
  maxModules: 0,

  // Add built modules information
  modules: isVerbose,

  // Sort the modules by a field
  // You can reverse the sort with `!field`. Default is `id`.
  modulesSort: 'field',

  // Show dependencies and origin of warnings/errors (since webpack 2.5.0)
  moduleTrace: isVerbose,

  // Show performance hint when file size exceeds `performance.maxAssetSize`
  performance: true,

  // Show the exports of the modules
  providedExports: false,

  // Add public path information
  publicPath: true,

  // Add information about the reasons why modules are included
  reasons: isVerbose,

  // Add the source code of modules
  source: false,

  // Add timing information
  timings: true,

  // Show which exports of a module are used
  usedExports: false,

  // Add webpack version information
  version: isVerbose,

  // Add warnings
  warnings: true,

  // Filter warnings to be shown (since webpack 2.4.0),
  // can be a String, Regexp, a function getting the warning and returning a boolean
  // or an Array of a combination of the above. First match wins.
  warningsFilter: (warning: string) => (
    warning.indexOf('node_modules/express') !== -1
    || warning.indexOf('node_modules/encoding') !== -1
    || warning.indexOf('config/index') !== -1
  ),
};

// Notify the user that compilation has started and should be done soon.

// eslint-disable-next-line
console.log(`
===================================================
  Building application...
  This may take time depending on the application size.
  Thank you for your patience.
===================================================
`);
const imageExtensions: string [] = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'svg',
  'webp',
];
const isImageRule = (rule: RuleSetRule) => {
  let isValid = true;
  imageExtensions.forEach((ext) => {
    if (!isValid) return;
    if (rule.test instanceof RegExp) {
      // rule.test: RegExp
      isValid = rule.test.test(`.${ext}`);
    } else {
      isValid = false;
    }
  });
  return isValid;
};

const isBabelRule = (rule: RuleSetRule) => {
  if (typeof rule === 'undefined') return false;
  if (Array.isArray(rule.use)) {
    return rule.use.some((u: any) => u.loader && u.loader === 'babel-loader');
  }

  return (
    typeof rule.use === 'object'
    && rule.use.loader === 'babel-loader'
  );
};
const hasSyncedFileLoader = (rule: RuleSetRule) => {
  let hasSyncFile = false;
  if (Array.isArray(rule.use) && rule.use.length) {
    rule.use.forEach((u: any) => {
      if (hasSyncFile) return;
      if (
        u.loader === pawExistsSync(
          path.join(__dirname, '../webpack/plugins/synced-files-plugin/loader.js'),
        )
      ) {
        hasSyncFile = true;
      }
    });
  }

  if (rule.oneOf && rule.oneOf.length) {
    rule.oneOf.forEach((oneOf: RuleSetRule) => {
      if (hasSyncFile) return;
      if (oneOf.use && Array.isArray(oneOf.use)) {
        oneOf.use.forEach((u: any) => {
          if (hasSyncFile) return;
          if (
            u.loader === pawExistsSync(
              path.join(__dirname, '../webpack/plugins/synced-files-plugin/loader.js'),
            )
          ) {
            hasSyncFile = true;
          }
        });
      }
    });
  }
  return hasSyncFile;
};

let cleanDistFolder = false;
let copyPublicFolder = !fs.existsSync(path.join(directories.src, 'public'));
wHandler.hooks.beforeConfig.tap('AddSyncedFilesPlugin', (wEnv, wType, wConfigs) => {
  // Before fresh build remove images sync file from previous build
  const syncedOutputFilename = 'synced-files.json';
  const syncedOutputPath = directories.dist;
  if (fs.existsSync(path.join(syncedOutputPath, syncedOutputFilename))) {
    fs.unlinkSync(path.join(syncedOutputPath, syncedOutputFilename));
  }
  // Web specific configurations
  if (wType === 'web') {
    wConfigs.forEach((c: webpack.Configuration) => {
      const wConfig = c;
      if (!cleanDistFolder) {
        if (!wConfig.plugins) wConfig.plugins = [];
        /**
         * Check if plugins array exists and if it does
         * check if CleanWebpackPlugin exists inside the plugin array
         */
        const hasCleanWebpackPlugin = wConfig.plugins.some(p => p instanceof CleanWebpackPlugin);
        if (!hasCleanWebpackPlugin) {
          /**
           * Push CleanWebpackPlugin to plugin list and ask it to clean
           * the dist folder
           */
          wConfig.plugins.push(new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
              directories.dist,
            ],
          }));
          cleanDistFolder = true;
        }
      }

      if (!copyPublicFolder) {
        if (!wConfig.plugins) wConfig.plugins = [];
        /**
         * We need to make sure that everything inside the public folder
         * is copied as it is to the build/public folder
         */
        wConfig.plugins.push(new CopyWebpackPlugin([{
          from: path.join(directories.src, 'public'),
          to: directories.build,
        }]));
        copyPublicFolder = true;
      }

      // Initialize wConfig.module if not already exists
      if (!wConfig.module) wConfig.module = { rules: [] };
      wConfig.module.rules.forEach((r: webpack.RuleSetRule, index: number) => {
        const rule = r;
        /**
         * Check for babel rule and replace it with babel rule that
         * with babel web rule with param hot as false
         */
        if (isBabelRule(rule)) {
          // We already know that wConfig.module is not undefined
          // @ts-ignore
          wConfig.module.rules[index] = webRule({ hot: false });
        }

        if (isImageRule(rule) && !hasSyncedFileLoader(rule)) {
          if (rule.use) {
            rule.use = SyncedFilesPlugin.loader(rule.use);
          }
          if (rule.oneOf) {
            rule.oneOf = SyncedFilesPlugin.loaderOneOf(rule.oneOf);
          }
        }
      });

      const hasSyncedFilePlugin = wConfig.plugins
        && wConfig.plugins.some(p => p instanceof SyncedFilesPlugin);

      if (!hasSyncedFilePlugin) {
        if (typeof wConfig.plugins === 'undefined') wConfig.plugins = [];
        wConfig.plugins.push(new SyncedFilesPlugin({
          outputPath: syncedOutputPath,
          outputFileName: syncedOutputFilename,
        }));
      }

      const hasExtractEmittedAssets = wConfig.plugins
        && wConfig.plugins.some(p => p instanceof ExtractEmittedAssets);
      if (!hasExtractEmittedAssets) {
        if (typeof wConfig.plugins === 'undefined') wConfig.plugins = [];
        wConfig.plugins.push(new ExtractEmittedAssets({
          outputPath: directories.dist,
        }));
      }
    });
  }
  if (wType === 'server') {
    wConfigs.forEach((c: webpack.Configuration) => {
      const wConfig = c;
      if (
        wConfig.entry === pawExistsSync(
          path.join(process.env.LIB_ROOT || '', './src/server/server'),
        )
      ) {
        // eslint-disable-next-line
        wConfig.entry = pawExistsSync(path.join(process.env.LIB_ROOT || '', './src/server/build'));
      }
      if (!wConfig.externals) wConfig.externals = {};

      // Add paw-assets as externals
      // @ts-ignore
      if (typeof wConfig.externals['pwa-assets'] === 'undefined') {
        // @ts-ignore
        wConfig.externals['pwa-assets'] = './assets.json';
      }

      if (!wConfig.module) wConfig.module = { rules: [] };
      wConfig.module.rules.forEach((rule: RuleSetRule, index: number) => {
        if (isBabelRule(rule)) {
          // @ts-ignore
          wConfig.module.rules[index] = serverRule({
            noChunk: true,
            hot: false,
          });
        }

        if (isImageRule(rule) && !hasSyncedFileLoader(rule)) {
          if (rule.use) {
            // eslint-disable-next-line
            rule.use = SyncedFilesPlugin.loader(rule.use);
          }

          if (rule.oneOf) {
            // eslint-disable-next-line
            rule.oneOf = SyncedFilesPlugin.loaderOneOf(rule.oneOf);
          }
        }
      });

      const hasSyncedFilePlugin = wConfig.plugins
        && wConfig.plugins.some(p => p instanceof SyncedFilesPlugin);
      if (!hasSyncedFilePlugin) {
        wConfig.plugins = wConfig.plugins || [];
        wConfig.plugins.push(new SyncedFilesPlugin({
          outputPath: syncedOutputPath,
          outputFileName: syncedOutputFilename,
        }));
      }
    });
  }
});

try {
  // Server configurations
  const serverConfig = wHandler.getConfig(process.env.PAW_ENV, 'server');

  // Web client configurations
  const webConfig = wHandler.getConfig(process.env.PAW_ENV, 'web');

  // Create a webpack web compiler from the web configurations
  webpack(webConfig, (webErr: Error, webStats: webpack.Stats) => {
    if (webErr || webStats.hasErrors()) {
      // eslint-disable-next-line
      console.log(webErr);
      // Handle errors here
      // eslint-disable-next-line
      webStats.toJson && console.log(webStats.toJson());
      // eslint-disable-next-line
      console.log('Web compiler error occurred. Please handle error here');
      return;
    }
    // eslint-disable-next-line
    console.log(webStats.toString(stats));
    webpack(serverConfig, (serverErr, serverStats) => {
      if (serverErr || serverStats.hasErrors()) {
        // Handle errors here
        // eslint-disable-next-line
        console.log('Server Compiler error occurred. Please handle error here');
        return;
      }

      // eslint-disable-next-line
      console.log(serverStats.toString(stats));

      if (pawConfig.singlePageApplication) {
        // eslint-disable-next-line
        console.log('Creating static files...');
        // @ts-ignore
        const outputConfig = serverConfig[0].output;
        // eslint-disable-next-line
        let server = require(pawExistsSync(path.join(outputConfig.path, outputConfig.filename)));
        server = server.default ? server.default : server;

        // eslint-disable-next-line
        console.log('Generating index.html & manifest.json');

        Promise.all([
          request(server).get('/'),
          request(server).get('/manifest.json'),
        ]).then(([indexResponse, manifestResponse]) => {
          fs.writeFileSync(path.join(directories.build, 'index.html'), indexResponse.text, 'utf-8');
          fs.writeFileSync(
            path.join(directories.build, 'manifest.json'),
            manifestResponse.text,
            'utf-8',
          );

          // eslint-disable-next-line
          console.log(`Successfully created: ${path.join(directories.build, 'index.html')}`);
          // eslint-disable-next-line
          console.log(`Successfully created: ${path.join(directories.build, 'manifest.json')}`);
        }).then(async () => {
          // eslint-disable-next-line
          console.log('\n\nRe-organizing files...\n');
          try {
            const tempPawJSBuildPath = path.join(directories.root, 'pawjs-temp-build');
            // Move to tempFolder
            await del([tempPawJSBuildPath]);
            mv(
              directories.build,
              tempPawJSBuildPath,
              {
                mkdirp: true,
                clobber: true,
              },
              async (err) => {
                if (err) {
                  // eslint-disable-next-line
                  console.error(err);
                  return;
                }
                await del([directories.dist]);
                mv(tempPawJSBuildPath, directories.dist, { clobber: true }, (err1) => {
                  if (err1) {
                    // eslint-disable-next-line
                    console.error(err1);
                    return;
                  }
                  // eslint-disable-next-line
                  console.log('Static site generated successfully.');
                  process.exit(0);
                });
              },
            );
          } catch (ex) {
            // eslint-disable-next-line
            console.log(ex);
          }
        });
      }
    });
  });
} catch (ex) {
  // eslint-disable-next-line
  console.log(ex);
}
