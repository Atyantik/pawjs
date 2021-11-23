import express from 'express';
import hsts from 'hsts';
import cookiesMiddleware from 'universal-cookie-express';
// eslint-disable-next-line
import ProjectServer from 'pawProjectServer';
import { createHash } from 'crypto';
import LRU from 'lru-cache';
import request from 'supertest';
import RouteHandler from '../router/handler';
import ServerHandler from './handler';
import env from '../config';
import { getFullRequestUrl } from '../utils/server';
import { RouteMatch } from 'react-router';

/**
 * Initialize express application
 * @type {*|Function}
 */
const app = express();
// Enable universal cookies
app.use(cookiesMiddleware());

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
  expressApp: app,
});

const serverMiddlewareList: express.Application[] = [];
sHandler.addPlugin(new ProjectServer({
  addPlugin: sHandler.addPlugin,
  addMiddleware: (middleware: express.Application) => {
    serverMiddlewareList.push(middleware);
  },
}));

const cacheLog = (...args: any) => {
  if (process.env.PAW_VERBOSE === 'true') {
    console.log(...args);
  }
};
const cacheOptions = sHandler.getCache();
const existingRequests: { [cacheKey: string]: Boolean } = {};
const isStartCmd = process.env.PAW_START_CMD === 'true';
if (cacheOptions && !isStartCmd) {
  // For singed integer, 2 bit is left for sign, thus it is not Math.pow(2, 32) but Math.pow(2, 30);
  const max32BitInt =  Math.pow(2, 30) - 1;
  // Create a superTest internal HTTP server to request and not record any
  // external request
  const internalHttpApp = request(app);

  const optMax = cacheOptions.max || 52428800;
  let optMaxAge = cacheOptions.maxAge;
  const optReCache = !!cacheOptions.reCache;
  if (typeof optMaxAge === 'undefined' || isNaN(optMaxAge)) {
    optMaxAge = 300000;
  }
  const cache = new LRU({
    max: optMax,
    maxAge: optMaxAge,
  });

  /**
   * Add stale while revalidate caching
   */
  app.use((
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (req.method === 'GET') {
      const fullUrl = getFullRequestUrl(req);

      // Parse url
      const url = new URL(fullUrl);
      // check if __no_cache is present as parameter
      const byPassCache = url.searchParams.has('__no_cache');

      // Delete __no_cache irrespectively
      url.searchParams.delete('__no_cache');

      // Non-Origin URL, that can be used by supertest to create
      const nonOriginUrl = url.toString().replace(url.origin, '');
      cacheLog(`${nonOriginUrl}:: byPass value: ${byPassCache}`);

      // The default cache key which only is dependent on the nonOriginUrl, considering the url Paramters
      // @todo: Correct the url paramters and re-create the url just in case for non-conflicting order of params
      // as order of params should not matter for cache.
      const defaultCacheKey = `__express__${nonOriginUrl}`;

      // create sha1 key hash for the provided key, either provided by custom handler
      // or the defaultCacheKey
      const cacheKey = createHash('sha1').update(sHandler.getCacheKey?.(req, res) || defaultCacheKey).digest('base64');

      const reCacheRequest = () => {
        if (existingRequests[cacheKey] === true) {
          return;
        }
        existingRequests[cacheKey] = true;
        // Execute the same request in background!
        url.searchParams.set('__no_cache', 'true');
        const nonOriginUrlWithNoCache = url.toString().replace(url.origin, '');
        url.searchParams.delete('__no_cache');
        cacheLog(`${nonOriginUrl}:: Re-Caching in the background`);
        internalHttpApp.get(nonOriginUrlWithNoCache).then(() => {
          existingRequests[cacheKey] = false;
          // do nothing.
          // This is required, else the request is killed halfway.
        });
      };

      // If this request is for byPassingCache, i.e. triggered internally,
      // Then do not return cache value
      if (!byPassCache && cache.has(cacheKey)) {
        // If cache found & not a byPassRequest
        cacheLog(`${nonOriginUrl}:: Cache found`);
        const cachedData: any = cache.get(cacheKey);

        // cache data should contain, headers, statusCode and data to be returned via cache.
        // if either of it is not defined, then do not return such cached data
        if (
          cachedData
          && cachedData.headers
          && cachedData.statusCode
          && cachedData.data
        ) {
          // Remove content-encoding and vary from the request as we will provide the
          // paramter from the current request only, get all other headerOptions
          const {
            ['content-encoding']: contentEncoding,
            vary,
            ...otherHeaders
          } = cachedData.headers;

          // Send the cached data
          cacheLog(`${nonOriginUrl}:: Sending cached`);
          res.set(otherHeaders);
          res.status(cachedData.statusCode);
          res.write(cachedData.data);

          // After sending the data, recache the data in the background
          reCacheRequest();
          return res.end();
        }
      }

      if (byPassCache) {
        cacheLog(`${nonOriginUrl}:: Caching was not used/checked as __no_cache was found in the url`);
      }

      let interceptedData: any = '';
      res.locals.cachedWrite = (data: string) => {
        interceptedData += data;
        return res.write(data);
      };

      res.on('finish', () => {
        // An appropriate response was returned to the user
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const headers = res.getHeaders();
            cacheLog(`${nonOriginUrl}:: Setting new cache`);
            let maxAge = optMaxAge;
            if (
              res.locals.currentPageRoutes &&
              Array.isArray(res.locals.currentPageRoutes)
              && res.locals.currentPageRoutes.length
            ) {
              res.locals.currentPageRoutes.forEach((match: RouteMatch) => {
                const { route } = match as any;
                if (typeof route.cache !== 'undefined') {
                  if (route.cache === false || route.cache < 0) {
                    maxAge = -1;
                  } else if (!isNaN(route.cache.maxAge)) {
                    maxAge = route.cache.maxAge;
                  }
                }
              });
            }
            if (maxAge > max32BitInt) {
              maxAge = max32BitInt;
            }
            cache.set(cacheKey, {
              url: nonOriginUrl,
              headers: JSON.parse(JSON.stringify(headers)),
              statusCode: res.statusCode,
              data: interceptedData,
            }, maxAge);

            if (optReCache && maxAge > 0) {
              setTimeout(() => {
                if (!cache.has(cacheKey)) {
                  reCacheRequest();
                } else {
                  cacheLog(`${nonOriginUrl}:: Still have cache, thus not executing, re-cache`);
                }
              }, maxAge + 1);
            }
          } catch (ex) {
            cacheLog(ex);
          }
        }
      });
    }
    return next();
  });
} else {
  app.use((_req, res, next) => {
    // Simply create wrapper of cachedWrite that does nothing.
    res.locals.cachedWrite = (data: string) => {
      return res.write(data);
    };
    next();
  });
}

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

serverMiddlewareList.forEach((middleware) => {
  app.use(middleware);
});

app.get(`${env.appRootUrl}/manifest.json`, (req, res) => {
  res.json(rHandler.getPwaSchema());
});

const assetExtensions = /\.(jpg|jpeg|gif|svg|mov|bmp|css|js|png|webp|pdf|doc|docx|json)/;
const isAssetRequest = (req: express.Request) => {
  const fullUrl = getFullRequestUrl(req);
  const parsedUrl = new URL(fullUrl);
  if (!parsedUrl.pathname) return false;
  return assetExtensions.test(parsedUrl.pathname);
};

app.get('*', (req, res, next) => {
  if (
    req.path.endsWith('favicon.png')
    || req.path.endsWith('favicon.ico')
    || req.path.endsWith('favicon.jpg')
    || req.path.endsWith('favicon.jpeg')
    || isAssetRequest(req)
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

  // If no server side rendering is necessary simply
  // run the handler and return streamed data
  if (!env.serverSideRender) {
    return sHandler.run({
      req,
      res,
      next,
      routeHandler: clientRouteHandler,
    });
  }
  // If server side render is enabled then, then let the routes load
  // Wait for all routes to load everything!
  return clientRouteHandler.hooks.initRoutes.callAsync(
    fullUrl,
    req.headers?.['user-agent'] ?? '',
    (err) => {
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
        routeHandler: clientRouteHandler,
      });
    },
  );
});

export { app };

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
