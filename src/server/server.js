import express from 'express';
import _ from 'lodash';
import hsts from 'hsts';
import ProjectServer from 'pawProjectServer';
import RouteHandler from '../router/handler';
import ServerHandler from './handler';
import env from '../config';
import { assetsToArray } from '../utils/utils';

/**
 * Initialize Route handler for PWA details
 * @type {RouteHandler}
 */
const rHandler = new RouteHandler({
  env: _.assignIn({}, env),
  isServer: true,
});

let ProjectRoutes = false;
if (env.serverSideRender) {
  // eslint-disable-next-line
  ProjectRoutes = require(`${process.env.PROJECT_ROOT}/src/routes`);
  if (ProjectRoutes.default) ProjectRoutes = ProjectRoutes.default;

  // Add route plugin
  rHandler.addPlugin(new ProjectRoutes({ addPlugin: rHandler.addPlugin }));
}

/**
 * Initialize server handler
 * @type {*}
 */
const sHandler = new ServerHandler({
  env: _.assignIn({}, env),
});

const serverMiddlewares = [];
sHandler.addPlugin(new ProjectServer({

  addPlugin: sHandler.addPlugin,
  addMiddleware: (middleware) => {
    serverMiddlewares.push(middleware);
  },
}));

/**
 * Initialize express application
 * @type {*|Function}
 */
const app = express();

// Disable x-powered-by (security issues)
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'PawJS');
  next();
});

serverMiddlewares.forEach((middleware) => {
  app.use(middleware);
});

/**
 * HSTS settings
 * @type {{enabled: *, maxAge: *, includeSubDomains: *, preload: *}}
 */
const hstsSettings = {
  enabled: env.hstsEnabled,
  maxAge: env.hstsMaxAge,
  includeSubDomains: env.hstsIncludeSubDomains, // Must be enabled to be approved by Google
  preload: env.hstsPreload,
};

if (hstsSettings.enabled) {
  // If HSTS is enabled and user is running on https protocol then add the hsts
  // middleware
  app.use((req, res, next) => {
    if (req.secure) {
      const hstsMiddleware = hsts(hstsSettings);
      hstsMiddleware(req, res, next);
    } else {
      next();
    }
  });
}

app.get(`${env.appRootUrl}/manifest.json`, (req, res) => {
  res.json(rHandler.getPwaSchema());
});

app.get('*', (req, res, next) => {
  if (
    req.path.endsWith('favicon.png')
    || req.path.endsWith('favicon.ico')
    || req.path.endsWith('favicon.jpg')
    || req.path.endsWith('favicon.jpeg')
  ) {
    return next();
  }
  const clientRouteHandler = new RouteHandler({
    env: _.assignIn({}, env),
    isServer: true,
  });

  // Add route plugin
  if (env.serverSideRender && ProjectRoutes) {
    clientRouteHandler.addPlugin(new ProjectRoutes({ addPlugin: clientRouteHandler.addPlugin }));
  }

  // Get the resources
  const assets = assetsToArray(res.locals.assets);

  // If no server side rendering is necessary simply
  // run the handler and return streamed data
  if (!env.serverSideRender) {
    return sHandler.run({
      req,
      res,
      next,
      assets,
      routeHandler: clientRouteHandler,
      cssDependencyMap: res.locals.cssDependencyMap,
    });
  }
  // If server side render is enabled then, then let the routes load
  // Wait for all routes to load everything!
  return clientRouteHandler.hooks.initRoutes.callAsync((err) => {
    if (err) {
      // eslint-disable-next-line
      console.log(err);
      // @todo: Handle Error
      return next();
    }

    // Once we have all the routes, pass the handler to the
    // server run at this point we should have cssDependencyMap as well.
    return sHandler.run({
      routeHandler: clientRouteHandler,
      req,
      res,
      next,
      assets,
      cssDependencyMap: res.locals.cssDependencyMap,
    });
  });
});

/**
 * Export this a middleware export.
 * @param req
 * @param res
 * @param next
 * @param PAW_GLOBAL
 * @returns {*}
 */
export default (req, res, next, PAW_GLOBAL) => {
  // Add global vars to middlewares and application
  Object.keys(PAW_GLOBAL).forEach((key) => {
    const val = PAW_GLOBAL[key];
    app.locals[key] = val;
    serverMiddlewares.forEach((sm) => {
      if (sm && sm.locals) {
        // eslint-disable-next-line
        sm.locals[key] = val;
      }
    });
  });

  return app.handle(req, res, next);
};

export const beforeStart = (serverConfig, PAW_GLOBAL, cb = function callback() {}) => {
  const setAppLocal = (key, value) => {
    if (!key) return;

    // eslint-disable-next-line
    PAW_GLOBAL[key] = value;
  };
  const getAppLocal = (key, defaultValue = false) => {
    if (!PAW_GLOBAL[key]) return defaultValue;
    return PAW_GLOBAL[key];
  };

  sHandler.hooks.beforeStart.callAsync(serverConfig, {
    setAppLocal,
    getAppLocal,
  }, cb);
};

export const afterStart = (PAW_GLOBAL, cb = function callback() {}) => {
  const setAppLocal = (key, value) => {
    if (!key) return;
    // eslint-disable-next-line
    PAW_GLOBAL[key] = value;
  };
  const getAppLocal = (key, defaultValue = false) => {
    if (!PAW_GLOBAL[key]) return defaultValue;
    return PAW_GLOBAL[key];
  };
  sHandler.hooks.afterStart.callAsync({
    setAppLocal,
    getAppLocal,
  }, cb);
};
