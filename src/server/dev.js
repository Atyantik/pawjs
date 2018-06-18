// eslint-disable-next-line
console.log(`
===================================================
  Compiling files.
  This may take time depending on the application size.
  Thank you for your patience.
===================================================
`);

// Notify the user that compilation has started and should be done soon.

const path = require("path");
const express = require("express");
const webpack = require("webpack");
const webpackMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const WebpackHandler = require("../webpack").handler;
const env = require("../config/index");
const weblog = require("webpack-log");

// Utils
// -- Require from string. create an export from string like `module.export = "Something";`
const requireFromString = require("../webpack/utils/requireFromString");

// Assets normalizer appending publicPath
const normalizeAssets = require("../webpack/utils/normalizeAssets");

// Server configurations
const wHandler = new WebpackHandler();
const serverConfig = wHandler.getConfig("development", "server");
const firstServerConfig = serverConfig[0];
const devServerConfig = firstServerConfig.devServer;

// Web client configurations
const webConfig = wHandler.getConfig("development", "web");

// Create a webpack server compiler from the server config
const serverCompiler = webpack(serverConfig);
const log = weblog({
  name: "pawjs"
});

// for core development
/**
 * STATS
 *
 stats: {
    colors: true,
    moduleTrace: false,
    reasons: false,
    entrypoints: false,
    maxModules: 0
  }
 *
 */
const devServerOptions = Object.assign({}, devServerConfig, {
  stats: {
    colors: true,
    reasons: false,
    entrypoints: false,
    modules: false,
    moduleTrace: false,
    assets: true,
    errors: true,
    cachedAssets: false,
    version: false,
  },
  logger: log,
  logLevel: "debug",
  noInfo: true,
  publicPath: firstServerConfig.output.publicPath
});

// Create a webpack web compiler from the web configurations
const webCompiler = webpack(webConfig);
const webOptions = Object.assign({}, {
  hot: true,
  inline: true,
  serverSideRender: true,
  stats: {
    colors: true,
    entrypoints: false,
    modules: false,
    moduleTrace: false,
    assets: true,
    reasons: false,
    errors: true,
    cachedAssets: false,
    version: false,
  },
  logger: log,
  logLevel: "debug",
  publicPath: webConfig[0].output.publicPath
});

const app = express();

// Disable x-powered-by for all requests
app.set("x-powered-by", "PawJS");

// Add server middleware
const serverMiddleware = webpackMiddleware(serverCompiler, devServerOptions);
app.use(serverMiddleware);


const getCommonServer = () => {
  const mfs = serverMiddleware.fileSystem;
  // Get content of the server that is compiled!
  const serverContent = mfs.readFileSync(serverMiddleware.getFilenameFromUrl(devServerOptions.publicPath + "/server.js"), "utf-8");
  
  return requireFromString(serverContent, {
    appendPaths: process.env.NODE_PATH.split(path.delimiter)
  });
};
// Add web middleware
const webMiddleware = webpackMiddleware(webCompiler, webOptions);

// On adding this middleware the SSR data to serverMiddleware will be lost in
// res.locals but its not needed anyway.
app.use(webMiddleware);

// Add hot middleware to the update
app.use(webpackHotMiddleware(webCompiler, {
  log: false,
  path: "/__hmr_update",
  heartbeat: 2000,
}));

app.use(env.appRootUrl, express.static(devServerOptions.contentBase));

/**
 * Below is where the magic happens!
 * We import the compiled server.js file as string and run it as module
 * thus we can get a fast experience of compilation and developer can
 * develop code with SSR enabled.
 */
app.use(function (req, res, next) {

  const mfs = serverMiddleware.fileSystem;
  const fileNameFromUrl = serverMiddleware.getFilenameFromUrl(devServerOptions.publicPath + req.path);

  // If the request is for static file, do not compute or send data to
  // server just execute the express default next functionality
  // to let it manage itself.
  if (
    // if the request is for favicon
    fileNameFromUrl.indexOf("favicon.ico") !== -1 || (
      // if the request exists in middleware filesystem
      mfs.existsSync(fileNameFromUrl) &&
      // and the request is for a file
      mfs.statSync(fileNameFromUrl).isFile()
    )
  ) {
    return next();
  }


  let CommonServerMiddleware;
  try {
    // Get content of the server that is compiled!
    const CommonServer = getCommonServer();
    CommonServerMiddleware = CommonServer.default;

    const {cssDependencyMap,...assets} = normalizeAssets(res.locals.webpackStats);
    res.locals.assets = assets;
    res.locals.cssDependencyMap = cssDependencyMap;

    return CommonServerMiddleware(req, res, next);
  } catch(ex) {
    // eslint-disable-next-line
    console.log(ex);
  }
  // Console.log
  next();
});

let totalCompilationComplete = 0;
webCompiler.hooks.done.tap("InformWebCompiled", () => {
  totalCompilationComplete++;
  if (totalCompilationComplete >=2 ) startServer();
});

serverCompiler.hooks.done.tap("InformServerCompiled", () => {
  totalCompilationComplete++;
  if (totalCompilationComplete >=2 ) startServer();
});

let serverStarted = false;

const startServer = () => {
  if (serverStarted) return;


  let beforeStart, afterStart = null;
  try {
    const CommonServer = getCommonServer();
    beforeStart = CommonServer.beforeStart;
    afterStart = CommonServer.afterStart;
  } catch (ex) {
    //eslint-disable-next-line
    console.log(ex);
  }



  const serverConfig = {
    port: devServerConfig.port,
    host: devServerConfig.host,
  };
  const _global = {};

  beforeStart(serverConfig, _global, (err) => {
    if (err) {
      //eslint-disable-next-line
      console.error(err);
      return;
    }

    app.listen(serverConfig.port, serverConfig.host, () => {

      serverStarted = true;
      // eslint-disable-next-line
      console.log(`

===================================================
  Listening to http://${serverConfig.host}:${serverConfig.port}
  Open the above url in your browser.        
===================================================
      `);
      afterStart(_global);
    });
  });
};
