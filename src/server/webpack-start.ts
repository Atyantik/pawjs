import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { NextHandleFunction } from 'connect';
import { assetsToArray } from '../utils/utils';
import pawConfig from '../config';
import directories from '../webpack/utils/directories';
import wHandler from '../webpack';

// Utils
// -- Require from string. create an export from string like `module.export = "Something";`
import requireFromString from '../webpack/utils/requireFromString';
// Assets normalizer appending publicPath
import normalizeAssets from '../webpack/utils/normalizeAssets';

interface IPawjsWebpackConfig extends webpack.Configuration {}

// Notify the user that compilation has started and should be done soon.
// eslint-disable-next-line
console.log(`
=========================================================
  Compiling files.
  This may take time depending on the application size.
  Thank you for your patience.
=========================================================
`);
if (pawConfig.hotReload) {
  wHandler
    .hooks
    .beforeConfig
    .tap(
      'AddHotReplacementPlugin',
      (
        wEnv: string,
        wType: string,
        wConfigs: IPawjsWebpackConfig [],
      ) => {
        // Add eval devtool to all the configs
        wConfigs.forEach((wConfig: IPawjsWebpackConfig) => {
          const config = wConfig;
          if (!config.devtool) {
            config.devtool = 'eval-source-map';
          }
        });

        // Web specific configurations
        if (wType === 'web') {
          wConfigs.forEach((webpackConfig: IPawjsWebpackConfig) => {
            const wConfig = webpackConfig as any;
            if (Array.isArray(wConfig?.entry?.client)) {

              // Add webpack-hot-middleware as entry point
              const hotMiddlewareString = 'webpack-hot-middleware/client?name=web&'
                + 'path=/__hmr_update&timeout=2000&overlay=true&quiet=false';

              wConfig.entry.client.unshift(hotMiddlewareString);

              // check for Hot Module replacement plugin and add it if necessary
              if (!wConfig.plugins) wConfig.plugins = [];
              wConfig.plugins.unshift(new ReactRefreshWebpackPlugin());
              wConfig.plugins.unshift(new webpack.HotModuleReplacementPlugin({
                multiStep: true,
              }));
            }
          });
        }
        if (wType === 'server') {
          wConfigs.forEach((webpackConfig: IPawjsWebpackConfig) => {
            const wConfig = webpackConfig as any;
            // Add express as externals
            if (!wConfig.externals) {
              wConfig.externals = {};
            }

            wConfig.externals.express = 'express';

            if (!wConfig.module) wConfig.module = { rules: [] };
            // do not emit image files for server!
            (wConfig.module.rules ?? []).forEach((r: any) => {
              const rule = r;
              if (rule.use && Array.isArray(rule.use)) {
                rule.use.forEach((use: any) => {
                  const u = use;
                  if (u.loader && u.loader === 'file-loader') {
                    if (!u.options) u.options = {};
                    u.options.emitFile = typeof u.options.emitFile !== 'undefined'
                      ? u.options.emitFile : false;
                  }
                });
              }
            });
          });
        }
      },
    );
}

try {
  // Server configurations
  const serverConfig = wHandler.getConfig(process.env.PAW_ENV, 'server');

  // Web client configurations
  const webConfig = wHandler.getConfig(process.env.PAW_ENV, 'web');

  const devServerConfig = {
    serverSideRender: pawConfig.serverSideRender,
    publicPath: pawConfig.resourcesBaseUrl,
  };

  const processEnv = process.env;
  const isVerbose = processEnv.PAW_VERBOSE === 'true';

  const commonOptions = {
    stats: {
      colors: true,
      reasons: isVerbose,
      entrypoints: isVerbose,
      modules: isVerbose,
      moduleTrace: isVerbose,
      assets: true,
      warnings: isVerbose,
      errors: true,
      cachedAssets: isVerbose,
      version: isVerbose,
    },
  };

  const serverOptions: any = {
    ...commonOptions,
    ...devServerConfig,
  };
  const webOptions = {
    ...commonOptions,
    serverSideRender: true,
    publicPath: pawConfig.resourcesBaseUrl,
  };

  // Create a webpack server compiler from the server config
  const serverCompiler = webpack(serverConfig);

  // Create a webpack web compiler from the web configurations
  const webCompiler = webpack(webConfig);

  const app = express();

  // Global for application
  const PAW_GLOBAL = {};

  // Disable x-powered-by for all requests
  app.set('x-powered-by', 'PawJS');

  // Add server middleware
  const serverMiddleware:
  webpackMiddleware.WebpackDevMiddleware
  & NextHandleFunction = webpackMiddleware(serverCompiler, serverOptions);

  app.use(serverMiddleware);

  const getCommonServer = () => {
    // @ts-ignore
    const mfs = serverMiddleware.context.outputFileSystem as any;
    // Get content of the server that is compiled!
    const serverFile = serverMiddleware.getFilenameFromUrl(
      `${serverOptions.publicPath}server.js`,
    );
    if (!serverFile) {
      throw new Error(`Cannot find server.js at ${serverOptions.publicPath}server.js`);
    }

    const serverContent = mfs.readFileSync(serverFile, 'utf-8');

    const nodePath = process.env.NODE_PATH || '';
    return requireFromString(serverContent, {
      appendPaths: nodePath.split(path.delimiter),
    });
  };
  // Add web middleware
  // @ts-ignore
  const webMiddleware = webpackMiddleware(webCompiler, webOptions);

  // On adding this middleware the SSR data to serverMiddleware will be lost in
  // res.locals but its not needed anyway.
  app.use(webMiddleware);

  if (pawConfig.hotReload) {
    // Add hot middleware to the update
    app.use(webpackHotMiddleware(webCompiler, {
      log: false,
      path: '/__hmr_update',
      heartbeat: 2000,
    }));
  }

  app.use(pawConfig.appRootUrl || '', express.static(path.join((directories.src || ''), 'public')));

  /**
   * Below is where the magic happens!
   * We import the compiled server.js file as string and run it as module
   * thus we can get a fast experience of compilation and developer can
   * develop code with SSR enabled.
   */
  app.use((req, res, next) => {
    const mfs = serverMiddleware.context.outputFileSystem as any;
    const fileNameFromUrl = serverMiddleware
      .getFilenameFromUrl(serverOptions.publicPath + req.path) || '';

    // If the request is for static file, do not compute or send data to
    // server just execute the express default next functionality
    // to let it manage itself.
    if (
      // if the request is for favicon
      fileNameFromUrl.indexOf('favicon.ico') !== -1 || (
        // if the request exists in middleware filesystem
        mfs.existsSync(fileNameFromUrl)
        // and the request is for a file
        && mfs.statSync(fileNameFromUrl).isFile()
      )
    ) {
      return next();
    }

    let commonServerMiddleware;
    try {
      // Get content of the server that is compiled!
      const commonServer = getCommonServer();
      const expressApp = commonServer.app;
      commonServerMiddleware = commonServer.default;
      const {
        jsDependencyMap,
        cssDependencyMap,
        ...assets
      } = normalizeAssets(webMiddleware.context.stats as webpack.Stats);
      expressApp.locals.assets = assetsToArray(assets);
      expressApp.locals.cssDependencyMap = cssDependencyMap;
      expressApp.locals.jsDependencyMap = jsDependencyMap;

      return commonServerMiddleware(req, res, next, PAW_GLOBAL);
    } catch (ex) {
      // eslint-disable-next-line
      console.log(ex);
    }
    // Console.log
    return next();
  });

  let serverStarted = false;

  const startServer = () => {
    if (serverStarted) return;

    let beforeStart: any;
    let afterStart: any;
    try {
      const commonServer = getCommonServer();
      beforeStart = commonServer.beforeStart;
      afterStart = commonServer.afterStart;
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.error(ex);
    }

    const nodeServerConfig = {
      port: pawConfig.port,
      host: pawConfig.host,
    };

    beforeStart(nodeServerConfig, PAW_GLOBAL, (err: Error) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return;
      }

      app.listen(
        parseInt(nodeServerConfig.port || '9090', 10),
        nodeServerConfig.host || '0.0.0.0',
        () => {
          serverStarted = true;
          // eslint-disable-next-line no-console
          console.log(`

===================================================
  Listening to http://${nodeServerConfig.host}:${nodeServerConfig.port}
  Open the above url in your browser.
===================================================`);
          afterStart(PAW_GLOBAL);
        },
      );
    });
  };

  let totalCompilationComplete = 0;
  webCompiler.hooks.done.tap('InformWebCompiled', () => {
    totalCompilationComplete += 1;
    if (totalCompilationComplete >= 2) startServer();
  });

  serverCompiler.hooks.done.tap('InformServerCompiled', () => {
    totalCompilationComplete += 1;
    if (totalCompilationComplete >= 2) startServer();
  });
} catch (ex) {
  // eslint-disable-next-line no-console
  console.error(ex);
}
