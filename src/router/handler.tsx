import { AsyncSeriesHook } from 'tapable';
import _uniq from 'lodash/uniq';
import _cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import { matchPath } from 'react-router';
// @ts-ignore
// eslint-disable-next-line
import pawSeoSchema from 'pawSeoConfig';
// @ts-ignore
// eslint-disable-next-line
import pawPwaSchema from 'pawPwaConfig';

import PwaIcon192 from '../resources/images/pwa-icon-192x192.png';
import PwaIcon512 from '../resources/images/pwa-icon-512x512.png';
import AsyncRouteLoadErrorComponent from '../components/AsyncRouteLoadError';
import AsyncRouteLoaderComponent from '../components/AsyncRouteLoader';
import NotFoundComponent from '../components/NotFound';
import ErrorComponent from '../components/Error';
import Status from '../components/RouteStatus';
import RouteCompiler from './compiler';
import { CompiledRoute, ReactComponent, Route } from '../@types/route';
import AbstractPlugin from '../abstract-plugin';
import { IRouteHandler } from './IRouteHandler';

export default class RouteHandler extends AbstractPlugin implements IRouteHandler {
  static defaultPwaSchema = Object.keys(pawPwaSchema).length
    ? { ...pawPwaSchema }
    : {
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

  static defaultSeoSchema = Object.keys(pawSeoSchema).length
    ? { ...pawSeoSchema }
    : {
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

  static computeRootMatch = (pathname: string) => ({
    path: '/', url: '/', params: {}, isExact: pathname === '/',
  });

  static matchRoutes = (...args: any[] | [any, any]) => {
    const [routes, pathname] = args;
    const branch = args.length > 2 && args[2] !== undefined ? args[2] : [];

    routes.some((route: Route) => {
      let match;

      if (route.path) {
        // @ts-ignore
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

  routes: CompiledRoute [] = [];

  components = {
    NotFoundComponent,
    ErrorComponent,
  };

  hooks: { initRoutes: AsyncSeriesHook<any> };

  routeCompiler: RouteCompiler;

  setDefaultSeoSchema: (schema?: {}) => void;

  getDefaultSeoSchema: () => any;

  setPwaSchema: (schema?: {}) => void;

  getPwaSchema: () => any;

  setDefaultLoadErrorComponent: (component: ReactComponent) => this;

  getDefaultLoadErrorComponent: () => ReactComponent;

  setDefaultLoaderComponent: (component: ReactComponent) => this;

  setDefaultLoadTimeout: (loadTimeout: number) => this;

  getDefaultLoadTimeout: () => number;

  set404Component: (component: ReactComponent) => void;

  get404Component: () => ReactComponent;

  getDefaultLoaderComponent: () => ReactComponent;

  setDefaultAllowedLoadDelay: (allowedDelay: number) => this;

  getDefaultAllowedLoadDelay: () => number;

  setErrorComponent: (component: ReactComponent) => void;

  getErrorComponent: () => ReactComponent;

  constructor(options: { env: any; isServer?: any; }) {
    super();
    this.routeCompiler = new RouteCompiler();
    this.hooks = {
      initRoutes: new AsyncSeriesHook(['URL']),
    };

    // Private methods
    let loadErrorComponent: ReactComponent = AsyncRouteLoadErrorComponent;
    let loaderComponent: ReactComponent = AsyncRouteLoaderComponent;
    let notFoundComponent: ReactComponent = NotFoundComponent;
    let errorComponent: ReactComponent = ErrorComponent;
    let seoSchema = { ...RouteHandler.defaultSeoSchema };
    let pwaSchema = { ...RouteHandler.defaultPwaSchema };
    pwaSchema.start_url = options.env.appRootUrl ? options.env.appRootUrl : '/';
    if (!pwaSchema.start_url.endsWith('/')) {
      pwaSchema.start_url = `${pwaSchema.start_url}/`;
    }

    let delay = 200;
    let timeout = 10000;

    this.setDefaultSeoSchema = (schema = {}) => {
      // eslint-disable-next-line no-console
      console.warn('DEPRECIATED: Do not set SEO Schema from router! Use `src/seo.ts` instead.');
      seoSchema = Object.assign(seoSchema, schema);
    };

    this.getDefaultSeoSchema = () => ({ ...seoSchema });

    this.setPwaSchema = (schema = {}) => {
      console.warn('DEPRECIATED: Do not set PWA Schema from router! Use `src/pwa.tsx` instead.');
      pwaSchema = Object.assign(pwaSchema, schema);
    };

    this.getPwaSchema = () => ({ ...pwaSchema });

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

    this.set404Component = (COMPONENT = () => null) => {
      notFoundComponent = () => (
        <Status code={404}>
          <COMPONENT />
        </Status>
      );
      return this;
    };
    this.get404Component = () => notFoundComponent;

    this.setErrorComponent = (COMPONENT = () => null) => {
      errorComponent = () => (
        <Status code={500}>
          <COMPONENT />
        </Status>
      );
    };

    this.getErrorComponent = () => errorComponent;
  }

  addRoute(route: Route) {
    const compiledRoute = this.routeCompiler.compileRoute(route, this);
    this.routes.push(compiledRoute);
    this.routes = _uniq(this.routes);
  }

  addRoutes(routes: Route []) {
    const compiledRoutes = this.routeCompiler.compileRoutes(routes, this);
    this.routes = this.routes.concat(compiledRoutes);
    this.routes = _uniq(this.routes);
  }

  getRoutes() {
    const routes = _cloneDeep(this.routes);
    routes.push({
      component: this.get404Component(),
      getRouteSeo: () => ({
        title: 'Page not found',
      }),
    });
    return routes;
  }
}
