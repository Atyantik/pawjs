// eslint-disable-next-line
console.log("Compiling files, please wait...");

const path = require("path");
const express = require("express");
const compression = require("compression");
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
const devServerOptions = Object.assign({}, devServerConfig, {
  stats: {
    colors: true,
    performance: false,
    moduleTrace: false,
    reasons: false,
    entrypoints: false,
    maxModules: 0,
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
    warnings: false,
    colors: true,
    maxModules: 0
  },
  publicPath: webConfig[0].output.publicPath
});

const app = express();
app.use(compression());

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

app.get("*", function (req, res, next) {

  const mfs = serverMiddleware.fileSystem;
  const fileNameFromUrl = serverMiddleware.getFilenameFromUrl(devServerOptions.publicPath + req.path);

  if (
    fileNameFromUrl.indexOf("favicon.ico") !== -1 || (
      mfs.existsSync(fileNameFromUrl) &&
      mfs.statSync(fileNameFromUrl).isFile()
    )
  ) {
    return next();
  }

  const serverContent = mfs.readFileSync(serverMiddleware.getFilenameFromUrl(devServerOptions.publicPath + "/server.js"), "utf-8");

  let CommonServerMiddleware;
  try {
    CommonServerMiddleware = requireFromString(serverContent, {
      appendPaths: process.env.NODE_PATH.split(path.delimiter)
    }).default;
  } catch(ex) {
    // eslint-disable-next-line
    console.log(ex);
  }

  const {cssDependencyMap,...assets} = normalizeAssets(res.locals.webpackStats);
  res.locals.assets = assets;
  res.locals.cssDependencyMap = cssDependencyMap;

  return CommonServerMiddleware(req, res, next);
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


