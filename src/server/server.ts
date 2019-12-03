import express from 'express';
import hsts from 'hsts';
import url from 'url';
// @ts-ignore
import { URL } from 'universal-url';
// eslint-disable-next-line
import ProjectServer from 'pawProjectServer';
import { NextHandleFunction } from 'connect';
import RouteHandler from '../router/handler';
import ServerHandler from './handler';
import env from '../config';
import { assetsToArray } from '../utils/utils';

/**
 * Initialize Route handler for PWA details
 * @type {RouteHandler}
 */
const rHandler = new RouteHandler({
  env: { ...env },
  isServer: true,
});
/* tslint:disable: variable-name */
let ProjectRoutes: any = false;
/* tslint:enable */
if (env.serverSideRender) {
  // eslint-disable-next-line
  ProjectRoutes = require('pawProjectRoutes');
  if (ProjectRoutes.default) ProjectRoutes = ProjectRoutes.default;

  // Add route plugin
  rHandler.addPlugin(new ProjectRoutes({ addPlugin: rHandler.addPlugin }));
}

/**
 * Initialize server handler
 * @type {*}
 */
const sHandler = new ServerHandler({
  env: { ...env },
});

const serverMiddlewareList: express.Application[] = [];
sHandler.addPlugin(new ProjectServer({
  addPlugin: sHandler.addPlugin,
  addMiddleware: (middleware: express.Application) => {
    serverMiddlewareList.push(middleware);
  },
}));

/**
 * Initialize express application
 * @type {*|Function}
 */
const app = express();

// Disable x-powered-by (security issues)
// Completely remove x-powered-by, previously it was PawJS
// But have removed it on various request
app.disable('x-powered-by');
/**
 * Enable trust proxy, i.e. allow data from
 * X-Protocol
 * X-Host
 * X-Forwarded-For
 */
app.enable('trust proxy');

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

serverMiddlewareList.forEach((middleware: NextHandleFunction) => {
  app.use(middleware);
});

app.get(`${env.appRootUrl}/manifest.json`, (req, res) => {
  res.json(rHandler.getPwaSchema());
});

const assetExtensions = /\.(jpg|jpeg|gif|svg|mov|bmp|css|js|png|webp|pdf|doc|docx|json)/;
const isAssetRequest = (path: string) => {
  const parsedUrl = url.parse(path);
  if (!parsedUrl.pathname) return false;
  return assetExtensions.test(parsedUrl.pathname);
};

app.get('*', (req, res, next) => {
  if (
    req.path.endsWith('favicon.png')
    || req.path.endsWith('favicon.ico')
    || req.path.endsWith('favicon.jpg')
    || req.path.endsWith('favicon.jpeg')
    || isAssetRequest(req.path)
  ) {
    return next();
  }
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

  const clientRouteHandler = new RouteHandler({
    env: { ...env },
    isServer: true,
  });

  // Add route plugin
  if (env.serverSideRender && ProjectRoutes) {
    // @ts-ignore
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
      jsDependencyMap: res.locals.jsDependencyMap,
    });
  }
  // If server side render is enabled then, then let the routes load
  // Wait for all routes to load everything!
  return clientRouteHandler.hooks.initRoutes.callAsync(new URL(fullUrl), (err: Error) => {
    if (err) {
      // eslint-disable-next-line
      console.log(err);
      // @todo: Handle Error
      return next();
    }

    // Once we have all the routes, pass the handler to the
    // server run at this point we should have cssDependencyMap as well.
    return sHandler.run({
      req,
      res,
      next,
      assets,
      routeHandler: clientRouteHandler,
      cssDependencyMap: res.locals.cssDependencyMap,
      jsDependencyMap: res.locals.jsDependencyMap,
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
export default (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
  PAW_GLOBAL: any,
) => {
  // Add global vars to middlewares and application
  Object.keys(PAW_GLOBAL).forEach((key) => {
    const val = PAW_GLOBAL[key];
    app.locals[key] = val;
    serverMiddlewareList.forEach((sm: express.Application) => {
      if (sm && sm.locals) {
        // eslint-disable-next-line
        sm.locals[key] = val;
      }
    });
  });

  // @ts-ignore
  return app.handle(req, res, next);
};

export const beforeStart = (
  serverConfig: any,
  PAW_GLOBAL: any,
  cb: any = function callback() {},
) => {
  const setAppLocal = (key: string, value: any) => {
    if (!key) return;

    // eslint-disable-next-line
    PAW_GLOBAL[key] = value;
  };
  const getAppLocal = (key: string, defaultValue: any = false) => {
    if (!PAW_GLOBAL[key]) return defaultValue;
    return PAW_GLOBAL[key];
  };

  sHandler.hooks.beforeStart.callAsync(
    serverConfig,
    {
      setAppLocal,
      getAppLocal,
    },
    cb,
  );
};

export const afterStart = (PAW_GLOBAL: any, cb = function callback() {}) => {
  const setAppLocal = (key: string, value: any) => {
    if (!key) return;
    // eslint-disable-next-line
    PAW_GLOBAL[key] = value;
  };
  const getAppLocal = (key: string, defaultValue: any = false) => {
    if (!PAW_GLOBAL[key]) return defaultValue;
    return PAW_GLOBAL[key];
  };
  sHandler.hooks.afterStart.callAsync(
    {
      setAppLocal,
      getAppLocal,
    },
    cb,
  );
};
