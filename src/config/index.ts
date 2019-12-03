import defaultConfig from './defaults.json';

interface IConfig {
  port?: string;
  host?: string;
  appRootUrl?: string;
  cdnUrl?: string;
  serverSideRender?: boolean;
  serviceWorker?: boolean;
  singlePageApplication?: boolean;
  asyncCSS?: boolean;
  polyfill?: string;
  clientRootElementId?: string;
  assetsMaxAge?: number;
  hstsEnabled?: boolean;
  hstsMaxAge?: number;
  hstsIncludeSubDomains?: boolean;
  hstsPreload?: boolean;
  resourcesBaseUrl?: string;
  hashedRoutes?: boolean;
  react?: string;
  noJS?: boolean;
}
let config: IConfig = {};
try {
  if (typeof process.env.pawConfig !== 'undefined') {
    config = JSON.parse(process.env.pawConfig);
  } else {
    const pawConfigPath = process.env.PAW_CONFIG_PATH;
    if (typeof pawConfigPath !== 'undefined') {
      // eslint-disable-next-line global-require,import/no-dynamic-require
      config = require(pawConfigPath);
    }
  }
} catch (ex) {
  // eslint-disable-next-line no-console
  // On no pawconfig.json found, do not display warning or error message
  // console.warn(ex);
  config = {};
}
config = { ...defaultConfig, ...config };

const getBool = (e: any, onUndefinedValue: any = undefined): boolean => {
  if (typeof e === 'undefined') {
    return onUndefinedValue;
  }
  if (Array.isArray(e)) {
    return e.length > 0;
  }
  if (typeof e === 'object') {
    return Object.keys(e).length > 0;
  }
  if (typeof e === 'string') {
    if (e === 'true' || e === '1' || e === 'yes') {
      return true;
    }
  }
  return false;
};

// Parse config with .env file params
config = {
  ...config,
  ...{
    port: process.env.PORT || config.port,
    host: process.env.HOST || config.host,
    appRootUrl: process.env.APP_ROOT_URL || config.appRootUrl,
    cdnUrl: process.env.CDN_URL || config.cdnUrl,
    serverSideRender: getBool(process.env.SSR_ENABLED, config.serverSideRender),
    serviceWorker: getBool(process.env.SERVICE_WORKER_ENABLED, config.serviceWorker),
    singlePageApplication: getBool(
      process.env.SINGLE_PAGE_APPLICATION,
      config.singlePageApplication,
    ),
    asyncCSS: getBool(process.env.ASYNC_CSS, config.asyncCSS),
    polyfill: getBool(process.env.POLYFILL_CDN) ? 'cdn' : config.polyfill,
    clientRootElementId: process.env.CLIENT_ROOT_ELEMENT_ID || config.clientRootElementId,
    assetsMaxAge: parseFloat(process.env.ASSETS_MAX_AGE || '') || config.assetsMaxAge,
    hstsEnabled: getBool(process.env.HSTS_ENABLED, config.hstsEnabled),
    hstsMaxAge: parseFloat(process.env.HSTS_MAX_AGE || '') || config.hstsMaxAge,
    hstsIncludeSubDomains: getBool(process.env.HSTS_INCLUDE_SUBDOMAINS, config.hstsEnabled),
    hstsPreload: getBool(process.env.HSTS_PRELOAD, config.hstsPreload),
    hashedRoutes: getBool(process.env.USE_HASHED_ROUTES, config.hashedRoutes),
    react: getBool(process.env.REACT_CDN) ? 'cdn' : config.react,
    noJS: getBool(process.env.DISABLE_JS, config.noJS),
  },
};

if (config.appRootUrl && config.appRootUrl.startsWith('http')) {
  throw new Error(
    'App root url cannot have a scheme in the string. should be like \'/\' or \'/subdir\'',
  );
}
if (config.appRootUrl && config.appRootUrl.endsWith('/')) {
  config.appRootUrl = config.appRootUrl.replace(/\/$/, '');
}

// Calculate resource base url via options provided by config itself!
let resourcesBaseUrl = config.cdnUrl ? config.cdnUrl : config.appRootUrl;
if (typeof resourcesBaseUrl === 'string' && !resourcesBaseUrl.endsWith('/')) {
  resourcesBaseUrl = `${resourcesBaseUrl}/`;
}
config.resourcesBaseUrl = resourcesBaseUrl;

// Give higher priority to env PORT than any other settings, until and unless changed by user
// in hook beforeStart!
if (
  typeof process.env.PORT !== 'undefined'
  && process.env.PORT.length
  && process.env.PORT.trim().length
) {
  config.port = process.env.PORT.trim();
}

// If not set hashedRoutes, and static output is set, then set hashedRoutes to true
if (typeof config.hashedRoutes === 'undefined' && config.singlePageApplication) {
  config.hashedRoutes = true;
}

// Managing polyfill
if (config.polyfill) {
  config.polyfill = config.polyfill.toLowerCase();
}

if (config.polyfill !== 'cdn' && config.polyfill !== 'internal') {
  config.polyfill = 'internal';
}

if (config.react) {
  config.react = config.react.toLowerCase();
}

if (config.react !== 'cdn' && config.react !== 'internal') {
  config.react = 'internal';
}

export default { ...config };
