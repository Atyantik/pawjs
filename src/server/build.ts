import express from 'express';
import _find from 'lodash/find';
import path from 'path';
import compression from 'compression';
// the below assets will be added by webpack. Don't worry about it
// @ts-ignore
// eslint-disable-next-line
import pawAssets from 'pwa-assets';
import server, { app as serverApp, beforeStart, afterStart } from './server';
import pawConfig from '../config';
import { assetsToArray } from '../utils/utils';

const { jsDependencyMap, cssDependencyMap, ...assets } = pawAssets;
/**
 * defining the current dir
 */
let currentDir = __dirname;
const PAW_GLOBAL = {};

// Set appropriate currentDir when build and run in production mode
const filename = _find(process.argv, (arg) => arg.indexOf('/server.js') !== -1);
if (filename) {
  currentDir = path.dirname(path.resolve(filename));
}
if (!currentDir) currentDir = __dirname;

const app = express();

// Enable compression while building.
app.use(compression({ threshold: '2KB' }));

// Disable x-powered-by (security issues)
// Completely remove x-powered-by, previously it was PawJS
// But have removed it on various request
app.disable('x-powered-by');

app.use(`${pawConfig.appRootUrl}/sw.js`, express.static(path.join(currentDir, 'build', 'sw.js'), {
  maxAge: 0,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-cache');
  },
}));

const cacheTime = pawConfig.assetsMaxAge || 86400000 * 30; // 30 days;
app.use(pawConfig.appRootUrl || '/', express.static(path.join(currentDir, 'build'), {
  maxAge: cacheTime,
}));

// Add assets to app locals, so it should not be passed with every request,
// thus optimizing the request payload
serverApp.locals.assets = assetsToArray(assets);
serverApp.locals.cssDependencyMap = cssDependencyMap;
serverApp.locals.jsDependencyMap = jsDependencyMap;

app.use((req, res, next) => server(req, res, next, PAW_GLOBAL));

export default app;

const serverConfig = {
  port: pawConfig.port,
  host: pawConfig.host,
};

beforeStart(serverConfig, PAW_GLOBAL, (err: Error) => {
  if (err) {
    // eslint-disable-next-line
    console.error(err);
    return;
  }

  if (!pawConfig.singlePageApplication) {
    app.listen(
      parseInt(serverConfig.port || '9090', 10),
      serverConfig.host || 'localhost',
      () => {
        // eslint-disable-next-line
        console.log(`Listening to http://${serverConfig.host}:${serverConfig.port}`);
        afterStart(PAW_GLOBAL);
      },
    );
  }
});
