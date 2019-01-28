import { AsyncSeriesHook } from 'tapable';
import _uniq from 'lodash/uniq';
import _cloneDeep from 'lodash/cloneDeep';
import { matchPath } from 'react-router';
import AsyncRouteLoadErrorComponent from '../components/AsyncRouteLoadError';
import AsyncRouteLoaderComponent from '../components/AsyncRouteLoader';
import NotFoundComponent from '../components/NotFound';
import ErrorComponent from '../components/Error';
import RouteCompiler from './compiler';
import PwaIcon192 from '../resources/images/pwa-icon-192x192.png';
import PwaIcon512 from '../resources/images/pwa-icon-512x512.png';

export default class RouteHandler {
  static defaultPwaSchema = {
    name: 'PawJS',
    short_name: 'PawJS',

    // Possible values ltr(left to right)/rtl(right to left)
    dir: 'ltr',

    // language: Default en-US
    lang: 'en-US',

    // Orientation of web-app possible:
    // any, natural, landscape, landscape-primary, landscape-secondary,
    // portrait, portrait-primary, portrait-secondary
    orientation: 'any',
    start_url: '/',
    background_color: '#fff',
    theme_color: '#fff',
    display: 'standalone',
    description: 'A highly scalable & plug-able, Progressive Web Application foundation with the best Developer Experience.',
    icons: [
      {
        src: PwaIcon192,
        sizes: '192x192',
      },
      {
        src: PwaIcon512,
        sizes: '512x512',
      },
    ],
  };

  static defaultSeoSchema = {
    title: 'PawJS',
    description: RouteHandler.defaultPwaSchema.description,
    keywords: [],
    image: '',
    site_name: RouteHandler.defaultPwaSchema.name,
    twitter: {
      site: '',
      creator: '',
    },
    facebook: {
      admins: [],
    },
    type: 'article', // article/product/music/video
    type_details: {
      section: '', // Lifestyle/sports/news
      published_time: '',
      modified_time: '',
    },
  };

  static computeRootMatch = pathname => ({
    path: '/', url: '/', params: {}, isExact: pathname === '/',
  });

  static matchRoutes = (...args) => {
    const [routes, pathname] = args;
    const branch = args.length > 2 && args[2] !== undefined ? args[2] : [];

    routes.some((route) => {
      let match;

      if (route.path) {
        match = matchPath(pathname, route);
      } else {
        match = branch.length ? branch[branch.length - 1].match // use parent match
          : RouteHandler.computeRootMatch(pathname);
      }

      if (match) {
        branch.push({ route, match });

        if (route.routes) {
          RouteHandler.matchRoutes(route.routes, pathname, branch);
        }
      }

      return match;
    });

    return branch;
  };

  routes = [];

  components = {
    NotFoundComponent,
    ErrorComponent,
  };

  constructor(options) {
    this.routeCompiler = new RouteCompiler({
      isServer: Boolean(options.isServer),
      env: options.env,
    });
    this.hooks = {
      initRoutes: new AsyncSeriesHook(),
    };

    // Private methods
    let loadErrorComponent = AsyncRouteLoadErrorComponent;
    let loaderComponent = AsyncRouteLoaderComponent;
    let notFoundComponent = NotFoundComponent;
    let errorComponent = ErrorComponent;
    let seoSchema = Object.assign({}, RouteHandler.defaultSeoSchema);
    let pwaSchema = Object.assign({}, RouteHandler.defaultPwaSchema);
    pwaSchema.start_url = options.env.appRootUrl ? options.env.appRootUrl : '/';
    if (!pwaSchema.start_url.endsWith('/')) {
      pwaSchema.start_url = `${pwaSchema.start_url}/`;
    }

    let delay = 200;
    let timeout = 10000;

    this.setDefaultSeoSchema = (schema = {}) => {
      seoSchema = Object.assign(seoSchema, schema);
    };

    this.getDefaultSeoSchema = () => Object.assign({}, seoSchema);

    this.setPwaSchema = (schema = {}) => {
      pwaSchema = Object.assign(pwaSchema, schema);
    };

    this.getPwaSchema = () => Object.assign({}, pwaSchema);

    this.setDefaultLoadErrorComponent = (component) => {
      loadErrorComponent = component;
      return this;
    };

    this.getDefaultLoadErrorComponent = () => loadErrorComponent;

    this.setDefaultLoaderComponent = (component) => {
      loaderComponent = component;
      return this;
    };

    this.getDefaultLoaderComponent = () => loaderComponent;

    this.setDefaultAllowedLoadDelay = (allowedDelay) => {
      delay = allowedDelay;
      return this;
    };

    this.getDefaultAllowedLoadDelay = () => delay;

    this.setDefaultLoadTimeout = (loadTimeout) => {
      timeout = loadTimeout;
      return this;
    };

    this.getDefaultLoadTimeout = () => timeout;

    this.set404Component = (component = () => null) => {
      notFoundComponent = component;
    };
    this.get404Component = () => notFoundComponent;

    this.setErrorComponent = (component = () => null) => {
      errorComponent = component;
    };

    this.getErrorComponent = () => errorComponent;
  }

  addRoute(route) {
    const compiledRoute = this.routeCompiler.compileRoute(route, this);
    this.routes.push(compiledRoute);
    this.routes = _uniq(this.routes);
  }

  addRoutes(routes) {
    const compiledRoutes = this.routeCompiler.compileRoutes(routes, this);
    this.routes = this.routes.concat(compiledRoutes);
    this.routes = _uniq(this.routes);
  }

  addPlugin(plugin) {
    try {
      if (plugin.hooks && Object.keys(plugin.hooks).length) {
        plugin.hooks.forEach((hookValue, hookName) => {
          this.hooks[hookName] = hookValue;
        });
      }
    } catch (ex) {
      // eslint-disable-next-line
      console.log(ex);
    }
    if (plugin.apply) {
      plugin.apply(this);
    }
  }

  getRoutes() {
    const routes = _cloneDeep(this.routes);
    routes.push({
      component: this.get404Component(),
    });
    return routes;
  }
}
