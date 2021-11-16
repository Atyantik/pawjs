import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import del from 'del';
import mv from 'mv';
import request from 'supertest';
import webpack, { RuleSetRule } from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import pawConfig from '../config';
import directories from '../webpack/utils/directories';
import wHandler from '../webpack';
import webRule from '../webpack/inc/babel-web-rule';
import serverRule from '../webpack/inc/babel-server-rule';
import ExtractEmittedAssets from '../webpack/plugins/extract-emitted-assets';

import { pawExistsSync } from '../globals';

const isVerbose = process.env.PAW_VERBOSE === 'true';

const stats = {
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
        const hasCleanWebpackPlugin = wConfig.plugins.some((p) => p instanceof CleanWebpackPlugin);
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
        wConfig.plugins.push(new CopyWebpackPlugin({
          patterns: [
            {
              from: path.join(directories.src, 'public'),
              to: directories.build,
            },
          ],
        }));
        copyPublicFolder = true;
      }

      // Initialize wConfig.module if not already exists
      if (!wConfig.module) wConfig.module = { rules: [] };
      if (!wConfig.module.rules) wConfig.module.rules = [];
      wConfig.module.rules.forEach((r: webpack.RuleSetRule | '...', index: number) => {
        const rule = r as RuleSetRule;
        /**
         * Check for babel rule and replace it with babel rule that
         * with babel web rule with param hot as false
         */
        if (isBabelRule(rule)) {
          // We already know that wConfig.module is not undefined
          // @ts-ignore
          wConfig.module.rules[index] = webRule({ hot: false });
        }
      });

      const hasExtractEmittedAssets = wConfig.plugins
        && wConfig.plugins.some((p) => p instanceof ExtractEmittedAssets);
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
      if (!wConfig.module.rules) wConfig.module.rules = [];
      wConfig.module.rules.forEach((moduleRule: RuleSetRule | '...', index: number) => {
        const rule = moduleRule as RuleSetRule;
        if (isBabelRule(rule)) {
          // @ts-ignore
          wConfig.module.rules[index] = serverRule({
            noChunk: true,
            hot: false,
          });
        }
      });
    });
  }
});

try {
  // Server configurations
  const serverConfig = wHandler.getConfig(process.env.PAW_ENV, 'server');

  // Web client configurations
  const webConfig = wHandler.getConfig(process.env.PAW_ENV, 'web');

  // Create a webpack web compiler from the web configurations
  webpack(webConfig, (webErr?: Error, webStats?: webpack.Stats) => {
    if (webErr || webStats?.hasErrors()) {
      // eslint-disable-next-line
      console.log(webErr);
      // Handle errors here
      // eslint-disable-next-line
      webStats?.toJson && console.log(webStats.toJson());
      // eslint-disable-next-line
      console.log('Web compiler error occurred. Please handle error here');
      return;
    }
    // eslint-disable-next-line
    console.log(webStats?.toString(stats));
    webpack(serverConfig, async (serverErr, serverStats) => {
      if (serverErr || serverStats?.hasErrors()) {
        // Handle errors here
        // eslint-disable-next-line
        console.log(serverStats?.toString(stats));
        return;
      }
      try {
        if (fs.existsSync(path.resolve(directories.dist, 'images'))) {
          fse.moveSync(
            path.resolve(directories.dist, 'images'),
            path.resolve(directories.build, 'images'),
            { overwrite: true },
          );
        }
      } catch (ex) { console.log(ex); }

      try {
        if (fs.existsSync(path.resolve(directories.dist, 'assets'))) {
          fse.moveSync(
            path.resolve(directories.dist, 'assets'),
            path.resolve(directories.build, 'assets'),
            { overwrite: true },
          );
        }

      } catch (ex) {
        console.log(ex);
      }


      // eslint-disable-next-line
      console.log(serverStats?.toString(stats));

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
