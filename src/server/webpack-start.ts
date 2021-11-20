import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import { assetsToArray } from '../utils/utils';
import pawConfig from '../config';
import directories from '../webpack/utils/directories';
import wHandler from '../webpack';

// Utils
// -- Require from string. create an export from string like `module.export = "Something";`
import requireFromString from '../webpack/utils/requireFromString';
// Assets normalizer appending publicPath
import normalizeAssets from '../webpack/utils/normalizeAssets';

// Notify the user that compilation has started and should be done soon.
// eslint-disable-next-line
console.log(`
=========================================================
  Compiling files.
  This may take time depending on the application size.
  Thank you for your patience.
=========================================================
`);

try {
  // Server configurations
  const serverConfig = wHandler.getConfig(process.env.PAW_ENV, 'server')?.[0];

  // Web client configurations
  const webConfig = wHandler.getConfig(process.env.PAW_ENV, 'web')?.[0];

  const devServerConfig = {
    serverSideRender: pawConfig.serverSideRender,
    publicPath: pawConfig.resourcesBaseUrl,
  };

  const processEnv = process.env;
  const isVerbose = processEnv.PAW_VERBOSE === 'true';

  const stats = {
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
  };

  const commonOptions: webpackDevMiddleware.Options = { stats };

  const serverOptions: webpackDevMiddleware.Options = {
    ...commonOptions,
    ...devServerConfig,
  };
  const webOptions: webpackDevMiddleware.Options = {
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
  const serverMiddleware = webpackDevMiddleware(serverCompiler, serverOptions);
  app.use(serverMiddleware);

  // Add web middleware
  const webMiddleware = webpackDevMiddleware(webCompiler, webOptions);
  // On adding this middleware the SSR data to serverMiddleware will be lost in
  // res.locals but its not needed anyway.
  app.use(webMiddleware);

  let startServer: () => void = () => {};

  let checkTimeout: ReturnType<typeof setTimeout>;
  let checkRetries = 0;
  const checkInNext2Seconds = () => {
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }
    checkTimeout = setTimeout(() => {
      checkRetries += 1;
      startServer();
    }, 2000);
  };

  const getCommonServer = () => {
    if (checkRetries < 10 && !serverMiddleware?.context?.stats) {
      checkInNext2Seconds();
      return;
    }
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }
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
      } = normalizeAssets(webMiddleware?.context?.stats ?? null);
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

  startServer = () => {
    if (serverStarted) return;

    let beforeStart: any;
    let afterStart: any;
    try {
      const commonServer = getCommonServer();
      if (!commonServer) return;
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
  webCompiler.hooks.done.tap('InformWebCompiled', startServer);
  serverCompiler.hooks.done.tap('InformServerCompiled', startServer);
} catch (ex) {
  // eslint-disable-next-line no-console
  console.error(ex);
}
