import express from "express";
import _ from "lodash";
import server, { beforeStart, afterStart } from "./common";
import path from "path";
import compression from "compression";
// the below assets will be added by webpack. Don't worry about it
import pawAssets from "pwa-assets";

const {cssDependencyMap, ...assets} = pawAssets;
/**
 * defining the current dir
 */
let currentDir = __dirname;
const _global = {};

// Set appropriate currentDir when build and run in production mode
const filename = _.find(process.argv, arg => {
  return arg.indexOf("/server.js") !== -1;
});
if (filename) {
  currentDir = path.dirname(filename);
}

const app = express();

// Enable compression in production mode only.
app.use(compression());

// Disable x-powered-by for all requests
app.set("x-powered-by", "PawJS");

app.use(`${process.env.__config_appRootUrl}/sw.js`, express.static(path.join(currentDir, "build", "sw.js"), {
  maxAge: 0,
  setHeaders: (res) => {
    res.set("Cache-Control", "no-cache");
  }
}));

const cacheTime = 86400000*30;     // 30 days;
app.use(process.env.__config_appRootUrl, express.static(path.join(currentDir, "build"), {
  maxAge: cacheTime
}));

app.use((req, res, next) => {
  res.locals.assets = assets;
  res.locals.cssDependencyMap = cssDependencyMap;
  next();
});
app.use((req, res, next) => {
  return server(req, res, next, _global);
});


const serverConfig = {
  port: process.env.__config_port,
  host: process.env.__config_host,
};

beforeStart(serverConfig, _global, (err) => {
  if (err) {
    //eslint-disable-next-line
    console.error(err);
    return;
  }

  app.listen(serverConfig.port, serverConfig.host, () => {
    // eslint-disable-next-line
    console.log(`Listening to http://${serverConfig.host}:${serverConfig.port}`);
    afterStart(_global);
  });
});

