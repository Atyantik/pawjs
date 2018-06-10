// eslint-disable-next-line
console.log("Compiling files, please wait...");

// Notify the user that compilation has started and should be done soon.

const path = require("path");
const express = require("express");
const webpack = require("webpack");
const webpackMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");

// Utils
// -- Require from string. create an export from string like `module.export = "Something";`
const requireFromString = require("../webpack/utils/requireFromString");

// Assets normalizer appending publicPath
const normalizeAssets = require("../webpack/utils/normalizeAssets");

// Server configurations
const serverConfig = require("../webpack/dev/node-server.config");
const firstServerConfig = serverConfig[0];
const devServerConfig = firstServerConfig.devServer;

// Web client configurations
const webConfig = require("../webpack/dev/web.config");

// Create a webpack server compiler from the server config
const serverCompiler = webpack(serverConfig);

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
    moduleTrace: false,
    reasons: false,
    entrypoints: false,
    maxModules: 0,
    chunks: false,
    assets: false,
    children: false,
    hash: false,
    modules: false,
    publicPath: false,
    timings: false,
    version: false
  },
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
    maxModules: 0,
    moduleTrace: false,
    chunks: false,
    children: false,
    hash: false,
    modules: false,
    publicPath: false,
    timings: false,
    version: false
  },
  publicPath: webConfig[0].output.publicPath
});

const app = express();

// Disable x-powered-by for all requests
app.set("x-powered-by", "PawJS");

// Add server middleware
const serverMiddleware = webpackMiddleware(serverCompiler, devServerOptions);
app.use(serverMiddleware);

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

app.use(express.static(devServerOptions.contentBase));

/**
 * Below is where the magic happens!
 * We import the compiled server.js file as string and run it as module
 * thus we can get a fast experience of compilation and developer can
 * develop code with SSR enabled.
 */
app.get("*", function (req, res, next) {

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

  // Get content of the server that is compiled!
  const serverContent = mfs.readFileSync(serverMiddleware.getFilenameFromUrl(devServerOptions.publicPath + "/server.js"), "utf-8");


  let CommonServerMiddleware;
  try {
    CommonServerMiddleware = requireFromString(serverContent, {
      appendPaths: process.env.NODE_PATH.split(path.delimiter)
    }).default;

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
  app.listen(devServerConfig.port, devServerConfig.host, () => {
    serverStarted = true;
    // eslint-disable-next-line
    console.log(`Listening to http://${devServerConfig.host}:${devServerConfig.port}`);
  });
};
