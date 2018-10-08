import express from 'express';
import _find from 'lodash/find';
import path from 'path';
import compression from 'compression';
// the below assets will be added by webpack. Don't worry about it
// eslint-disable-next-line
import pawAssets from 'pwa-assets';
import server, { beforeStart, afterStart } from './server';
import pawConfig from '../config';

const { cssDependencyMap, ...assets } = pawAssets;
/**
 * defining the current dir
 */
let currentDir = __dirname;
const PAW_GLOBAL = {};

// Set appropriate currentDir when build and run in production mode
const filename = _find(process.argv, arg => arg.indexOf('/server.js') !== -1);

if (filename) {
  currentDir = path.dirname(path.resolve(filename));
}
if (!currentDir) currentDir = __dirname;

const app = express();

// Enable compression while building.
app.use(compression());

// Disable x-powered-by for all requests
app.set('x-powered-by', 'PawJS');

app.use(`${pawConfig.appRootUrl}/sw.js`, express.static(path.join(currentDir, 'build', 'sw.js'), {
  maxAge: 0,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-cache');
  },
}));

const cacheTime = 86400000 * 30; // 30 days;
app.use(pawConfig.appRootUrl, express.static(path.join(currentDir, 'build'), {
  maxAge: cacheTime,
}));

app.use((req, res, next) => {
  res.locals.assets = assets;
  res.locals.cssDependencyMap = cssDependencyMap;
  next();
});
app.use((req, res, next) => server(req, res, next, PAW_GLOBAL));

export default app;


const serverConfig = {
  port: pawConfig.port,
  host: pawConfig.host,
};

beforeStart(serverConfig, PAW_GLOBAL, (err) => {
  if (err) {
    // eslint-disable-next-line
    console.error(err);
    return;
  }

  if (!pawConfig.singlePageApplication) {
    app.listen(serverConfig.port, serverConfig.host, () => {
      // eslint-disable-next-line
      console.log(`Listening to http://${serverConfig.host}:${serverConfig.port}`);
      afterStart(PAW_GLOBAL);
    });
  }
});
