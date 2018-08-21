import express from "express";
import _ from "lodash";
import RouteHandler from "../router/handler";
import ServerHandler from "./handler";
import hsts from "hsts";
import env from "../config";
import { assetsToArray } from "../utils/utils";
import ProjectServer from "pawProjectServer";

/**
 * Initialize Route handler
 * @type {RouteHandler}
 */
const rHandler = new RouteHandler({
  env: _.assignIn({}, env),
  isServer: true,
});

let ProjectRoutes = require(`${process.env.__project_root}/src/routes`);
if (ProjectRoutes.default) ProjectRoutes = ProjectRoutes.default;

// Add route plugin
rHandler.addPlugin(new ProjectRoutes({addPlugin: rHandler.addPlugin}));

/**
 * Initialize server handler
 * @type {*}
 */
const sHandler = new ServerHandler({
  env: _.assignIn({}, env)
});

const serverMiddlewares = [];
sHandler.addPlugin(new ProjectServer({
  
  addPlugin: sHandler.addPlugin,
  addMiddleware: (middleware) => {
    serverMiddlewares.push(middleware);
  }
}));

/**
 * Initialize express application
 * @type {*|Function}
 */
const app = express();

// Disable x-powered-by (security issues)
app.use(function (req, res, next) {
  res.setHeader("X-Powered-By", "PawJS");
  next();
});

serverMiddlewares.forEach(middleware => {
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
  app.use(hsts(_.assignIn(hstsSettings, {
    // Enable hsts for https sites
    setIf: function (req) {
      return req.secure || (req.headers["x-forwarded-proto"] === "https");
    }
  })));
}

app.get(`${env.appRootUrl}/manifest.json`, (req, res) => {
  res.json(rHandler.getPwaSchema());
});

app.get("*", (req, res, next) => {
  
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
      routeHandler: rHandler,
      cssDependencyMap: res.locals.cssDependencyMap
    });
  }
  // If server side render is enabled then, then let the routes load
  // Wait for all routes to load everything!
  rHandler.hooks.initRoutes.callAsync(err => {
    if (err) {
      // eslint-disable-next-line
      console.log(err);
      // @todo: Handle Error
      return next();
    }
    
    // Once we have all the routes, pass the handler to the
    // server run at this point we should have cssDependencyMap as well.
    return sHandler.run({
      routeHandler: rHandler,
      req,
      res,
      next,
      assets,
      cssDependencyMap: res.locals.cssDependencyMap
    });
  });
});

/**
 * Export this a middleware export.
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
export default (req, res, next, _global) => {
  
  // Add global vars to middlewares and application
  for (let key in _global) {
    let val = _global[key];
    app.locals[key] = val;
    serverMiddlewares.forEach(sm => {
      if (sm && sm.locals) {
        sm.locals[key] = val;
      }
    });
  }
  
  return app.handle(req, res, next);
};

export const beforeStart = (serverConfig, _global, cb = function() {}) => {
  
  const setAppLocal = (key, value) => {
    if (!key) return;
    _global[key] = value;
  };
  const getAppLocal = (key, defaultValue = false) => {
    if (!_global[key]) return defaultValue;
    return _global[key];
  };
  
  sHandler.hooks.beforeStart.callAsync(serverConfig, {
    setAppLocal,
    getAppLocal,
  }, cb);
};

export const afterStart = (_global, cb = function() {}) => {
  const setAppLocal = (key, value) => {
    if (!key) return;
    _global[key] = value;
  };
  const getAppLocal = (key, defaultValue = false) => {
    if (!_global[key]) return defaultValue;
    return _global[key];
  };
  sHandler.hooks.afterStart.callAsync({
    setAppLocal,
    getAppLocal,
  }, cb);
};
