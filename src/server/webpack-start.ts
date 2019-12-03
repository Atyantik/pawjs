/* global pawExistsSync */
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webLog from 'webpack-log';
import { NextHandleFunction } from 'connect';
import pawConfig from '../config';
import directories from '../webpack/utils/directories';
import wHandler from '../webpack';
// Utils
// -- Require from string. create an export from string like `module.export = "Something";`
import requireFromString from '../webpack/utils/requireFromString';
// Assets normalizer appending publicPath
import normalizeAssets from '../webpack/utils/normalizeAssets';

interface IPawjsWebpackConfig extends webpack.Configuration {
  entry: any;
  externals: any;
}
// Notify the user that compilation has started and should be done soon.
// eslint-disable-next-line
console.log(`
=========================================================
  Compiling files.
  This may take time depending on the application size.
  Thank you for your patience.
=========================================================
`);
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
          if (!config.resolve) config.resolve = {};
          if (!config.resolve.alias) config.resolve.alias = {};
          if (!config.resolve.alias['react-dom']) {
            config.resolve.alias['react-dom'] = '@hot-loader/react-dom';
          }
        }
      });

      // Web specific configurations
      if (wType === 'web') {
        wConfigs.forEach((webpackConfig: IPawjsWebpackConfig) => {
          const wConfig = webpackConfig;
          if (
            typeof wConfig.entry !== 'undefined'
            && typeof wConfig.entry.client !== 'undefined'
            && Array.isArray(wConfig.entry.client)
          ) {
            const libRoot = process.env.LIB_ROOT;
            if (typeof libRoot === 'undefined') {
              return;
            }
            let clientIndex = wConfig
              .entry
              .client
              .indexOf(
                pawExistsSync(path.join(libRoot, 'src', 'client', 'app')),
              );

            // Add webpack-hot-middleware as entry point
            const hotMiddlewareString = 'webpack-hot-middleware/client?name=web&'
              + 'path=/__hmr_update&timeout=2000&overlay=true&quiet=false';

            if (!wConfig.entry.client.includes(hotMiddlewareString)) {
              if (clientIndex === -1) {
                wConfig.entry.client.unshift(hotMiddlewareString);
              } else {
                wConfig.entry.client.splice(clientIndex, 0, hotMiddlewareString);
                clientIndex += 1;
              }
            }

            // Replace app with hot-app
            if (
              wConfig.entry.client.includes(
                pawExistsSync(
                  path.join(libRoot, 'src', 'client', 'app'),
                ),
              )
            ) {
              // eslint-disable-next-line
              wConfig.entry.client[clientIndex] = pawExistsSync(
                path.join(libRoot, 'src', 'client', 'hot-app'),
              );
            }

            // check for Hot Module replacement plugin and add it if necessary
            if (!wConfig.plugins) wConfig.plugins = [];
            const hasHotPlugin = wConfig.plugins
              .some(p => p instanceof webpack.HotModuleReplacementPlugin);

            if (!hasHotPlugin) {
              wConfig.plugins.unshift(new webpack.HotModuleReplacementPlugin({
                multiStep: true,
              }));
            }
          }
        });
      }
      if (wType === 'server') {
        wConfigs.forEach((webpackConfig: IPawjsWebpackConfig) => {
          const wConfig = webpackConfig;
          // Add express as externals
          if (!wConfig.externals) {
            wConfig.externals = {};
          }

          wConfig.externals.express = 'express';

          if (!wConfig.module) wConfig.module = { rules: [] };
          // do not emit image files for server!
          wConfig.module.rules.forEach((r: any) => {
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

try {
  // Server configurations
  const serverConfig = wHandler.getConfig(process.env.PAW_ENV, 'server');

  // Web client configurations
  const webConfig = wHandler.getConfig(process.env.PAW_ENV, 'web');

  const devServerConfig = {
    port: pawConfig.port,
    host: pawConfig.host,
    serverSideRender: pawConfig.serverSideRender,
    publicPath: pawConfig.resourcesBaseUrl,
    contentBase: path.join((directories.src || ''), 'public'),
  };

  // Create new logging entity, pawjs
  const log = webLog({
    name: 'pawjs',
  });

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
      warningsFilter: (warning: string) => (
        warning.indexOf('node_modules/express') !== -1
        || warning.indexOf('node_modules/encoding') !== -1
        || warning.indexOf('config/index') !== -1
      ),
    },
    logger: log,
    logLevel: 'debug',
    noInfo: !isVerbose,
    hot: true,
  };

  const serverOptions: any = {
    ...commonOptions,
    ...devServerConfig,
  };
  const webOptions = {
    ...commonOptions,
    inline: true,
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
    const mfs = serverMiddleware.fileSystem;
    // Get content of the server that is compiled!
    const serverFile = serverMiddleware.getFilenameFromUrl(
      `${serverOptions.publicPath}/server.js`,
    );
    if (!serverFile) {
      throw new Error(`Cannot find server.js at ${serverOptions.publicPath}/server.js`);
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

  // Add hot middleware to the update
  app.use(webpackHotMiddleware(webCompiler, {
    log: false,
    path: '/__hmr_update',
    heartbeat: 2000,
  }));

  app.use(pawConfig.appRootUrl || '', express.static(serverOptions.contentBase));

  /**
   * Below is where the magic happens!
   * We import the compiled server.js file as string and run it as module
   * thus we can get a fast experience of compilation and developer can
   * develop code with SSR enabled.
   */
  app.use((req, res, next) => {
    const mfs = serverMiddleware.fileSystem;
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
      commonServerMiddleware = commonServer.default;

      const {
        jsDependencyMap,
        cssDependencyMap,
        ...assets
      } = normalizeAssets(res.locals.webpackStats);
      res.locals.assets = assets;
      res.locals.cssDependencyMap = cssDependencyMap;
      res.locals.jsDependencyMap = jsDependencyMap;

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
      port: devServerConfig.port,
      host: devServerConfig.host,
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
