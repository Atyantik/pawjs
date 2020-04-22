import { createBrowserHistory } from 'history';
import invert from 'lodash/invert';
import get from 'lodash/get';
import React from 'react';
import { renderRoutes } from 'react-router-config';
import { Router } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { render, hydrate } from 'react-dom';
import {
  Hook,
  AsyncSeriesHook,
  AsyncParallelBailHook,
  SyncHook,
} from 'tapable';
import RouteHandler from '../router/handler';
import ErrorBoundary from '../components/ErrorBoundary';
import { generateMeta } from '../utils/seo';
import possibleStandardNames from '../utils/reactPossibleStandardNames';
import AbstractPlugin from '../abstract-plugin';
import { ICompiledRoute } from '../@types/route';

const possibleHtmlNames = invert(possibleStandardNames);
const getPossibleHtmlName = (key: string): string => possibleHtmlNames[key] || key;

type HistoryLocation = {
  pathname: string;
  search?: string;
  hash?: string;
  key?: string;
  state?: any;
};

const b64DecodeUnicode = (str: string) => decodeURIComponent(
  atob(str)
    .split('')
    .map(c => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
    .join(''),
);

export default class ClientHandler extends AbstractPlugin {
  historyUnlistener = null;

  routeHandler: RouteHandler | null = null;

  history: any;

  updatePageMetaTimeout = 0;

  hooks: {
    beforeRender: AsyncSeriesHook<any>;
    locationChange: AsyncParallelBailHook<any, any>;
    beforeLoadData: AsyncSeriesHook<any>;
    renderRoutes: AsyncSeriesHook<any>;
    renderComplete: SyncHook<any, any>;
    [s: string]: Hook<any, any> | AsyncSeriesHook<any>,
  };

  options: {
    env: any;
  };

  constructor(options: { env: any; }) {
    super();
    this.manageHistoryChange = this.manageHistoryChange.bind(this);

    window.PAW_HISTORY = window.PAW_HISTORY || createBrowserHistory({
      basename: options.env.appRootUrl,
    });
    this.history = window.PAW_HISTORY;
    this.historyUnlistener = this.history.listen(this.manageHistoryChange);

    this.hooks = {
      locationChange: new AsyncParallelBailHook(['location', 'action']),
      beforeLoadData: new AsyncSeriesHook(['setParams', 'getParams']),
      beforeRender: new AsyncSeriesHook(['Application']),
      renderRoutes: new AsyncSeriesHook(['AppRoutes']),
      renderComplete: new SyncHook(),
    };
    this.options = options;
    this.manageServiceWorker();
  }

  useHashRouter() {
    return (this.options.env.singlePageApplication && this.options.env.hashedRoutes);
  }

  getCurrentRoutes(location: HistoryLocation | typeof window.location = window.location) {
    if (!this.routeHandler) return [];
    const routes = this.routeHandler.getRoutes();
    const pathname = this.useHashRouter()
      ? (location.hash || '').replace('#', '')
      : window.location.pathname;
    return RouteHandler.matchRoutes(
      routes,
      pathname.replace(
        this.options.env.appRootUrl,
        '',
      ),
    );
  }

  manageHistoryChange(location: HistoryLocation, action: string) {
    this.hooks.locationChange.callAsync(location, action, () => null);
    if (this.routeHandler) {
      this.updatePageMeta(location).catch((e) => {
        // eslint-disable-next-line
        console.log(e);
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getTitle(metaTitle: string): string {
    const appName = process.env.APP_NAME || '';
    const titleSeparator = process.env.PAGE_TITLE_SEPARATOR || '|';
    if (!appName) {
      return metaTitle;
    }
    if (metaTitle === appName) {
      return metaTitle;
    }
    if (!metaTitle && appName) {
      return appName;
    }
    return `${metaTitle} ${titleSeparator} ${appName}`;
  }

  async updatePageMeta(location: HistoryLocation) {
    const updatePageMetaOnIdle = async (deadline: any) => {
      if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
        if (this.routeHandler === null) return false;
        const currentRoutes = this.getCurrentRoutes(location);
        const promises: Promise<any> [] = [];

        let seoData = {};
        const pwaSchema = this.routeHandler.getPwaSchema();
        const seoSchema = this.routeHandler.getDefaultSeoSchema();
        currentRoutes.forEach((r: { route: ICompiledRoute, match: any }) => {
          if (r.route && r.route.component && r.route.component.preload) {
            promises.push(r.route.component.preload(undefined, {
              route: r.route,
              match: r.match,
            }).promise);
          }
        });
        await Promise.all(promises);
        currentRoutes.forEach((r: { route: ICompiledRoute, match: any }) => {
          let routeSeo = {};
          if (r.route.getRouteSeo) {
            routeSeo = r.route.getRouteSeo();
          }
          seoData = { ...seoData, ...routeSeo };
        });
        const metaTags = generateMeta(seoData, {
          seoSchema,
          pwaSchema,
          baseUrl: window.location.origin,
          url: window.location.href,
        });

        metaTags.forEach((meta) => {
          let metaSearchStr = 'meta';
          let firstMetaSearchStr = '';
          const htmlMeta: any = {};

          if (meta.name === 'title') {
            document.title = this.getTitle(meta.content);
          }

          Object.keys(meta).forEach((key) => {
            htmlMeta[getPossibleHtmlName(key)] = meta[key];
            if (!firstMetaSearchStr) {
              firstMetaSearchStr = `meta[${getPossibleHtmlName(key)}=${JSON.stringify(meta[key])}]`;
            }
            metaSearchStr += `[${getPossibleHtmlName(key)}=${JSON.stringify(meta[key])}]`;
          });

          const alreadyExists = document.querySelector(metaSearchStr);
          if (!alreadyExists) {
            const previousExists = document.querySelector(firstMetaSearchStr);
            if (previousExists && previousExists.remove) {
              previousExists.remove();
            }

            const metaElement = document.createElement('meta');
            Object.keys(htmlMeta).forEach((htmlMetaKey) => {
              metaElement.setAttribute(htmlMetaKey, htmlMeta[htmlMetaKey]);
            });
            document.getElementsByTagName('head')[0].appendChild(metaElement);
          }
        });
      } else {
        if (this.updatePageMetaTimeout) {
          window.cancelIdleCallback(this.updatePageMetaTimeout);
        }
        /**
         * Update page meta tag once the window is idle
         */
        window.requestIdleCallback(updatePageMetaOnIdle);
      }
      return true;
    };
    if (this.updatePageMetaTimeout) {
      this.updatePageMetaTimeout = window.cancelIdleCallback(this.updatePageMetaTimeout);
    }
    /**
     * Update page meta tag once the window is idle
     */
    this.updatePageMetaTimeout = window.requestIdleCallback(updatePageMetaOnIdle);
    return true;
  }

  manageServiceWorker() {
    if (this.options.env.serviceWorker) {
      this.hooks.renderComplete.tap('AddServiceWorker', (err) => {
        if (err) return;
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register(
            `${this.options.env.appRootUrl}/sw.js`,
          ).catch(() => null);
        }
      });
    } else {
      // remove previously registered service worker
      this.hooks.renderComplete.tap('RemoveServiceWorker', (err) => {
        if (err) return;
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach(registration => registration.unregister());
          });
        }
      });
    }
  }

  getRenderer() {
    const { env } = this.options;
    const root = get(env, 'clientRootElementId', 'app');
    const domRootReference = document.getElementById(root);
    return (
      env.serverSideRender
      && !env.singlePageApplication
      && domRootReference
      && domRootReference.innerHTML !== ''
    ) ? hydrate : render;
  }

  async preloadCurrentRoutes() {
    if (!this.routeHandler) return false;
    const routes = this.routeHandler.getRoutes();
    const currentPageRoutes = RouteHandler.matchRoutes(
      routes,
      window.location.pathname.replace(
        this.options.env.appRootUrl,
        '',
      ),
    );
    const { preloadManager: { setParams, getParams } } = this.routeHandler.routeCompiler;
    await new Promise(r => this
      .hooks
      .beforeLoadData
      .callAsync(
        setParams,
        getParams,
        r,
      ));

    const promises: Promise<any> [] = [];
    if (window.PAW_PRELOADED_DATA) {
      const preloadedData = JSON.parse(b64DecodeUnicode(window.PAW_PRELOADED_DATA));
      currentPageRoutes.forEach((r: { route: ICompiledRoute, match: any }, i: number) => {
        if (
          (typeof preloadedData[i] !== 'undefined')
          && r.route && r.route.component && r.route.component.preload
        ) {
          const preloadInit = r.route.component.preload(preloadedData[i], {
            route: r.route,
            match: r.match,
          });
          promises.push(preloadInit.promise);
        } else if (r.route && r.route.component && r.route.component.preload) {
          const preloadInit = r.route.component.preload(undefined, {
            route: r.route,
            match: r.match,
          });
          promises.push(preloadInit.promise);
        }
      });
    }
    return Promise.all(promises);
  }

  async renderApplication() {
    if (!this.routeHandler) return false;
    const root = get(this.options.env, 'clientRootElementId', 'app');
    const domRootReference = document.getElementById(root);
    const renderer = this.getRenderer();
    const routes = this.routeHandler.getRoutes();
    const currentPageRoutes = this.getCurrentRoutes();
    const components: any = {};
    components.appRouter = this.useHashRouter() ? HashRouter : Router;

    let routerParams: any = {
      history: this.history,
    };
    if (this.options.env.singlePageApplication && this.options.env.hashedRoutes) {
      routerParams = {};
    }

    const appRoutes = {
      renderedRoutes: (
        <ErrorBoundary
          ErrorComponent={this.routeHandler.getErrorComponent()}
          NotFoundComponent={this.routeHandler.get404Component()}
        >
          {renderRoutes(routes)}
        </ErrorBoundary>
      ),
      setRenderedRoutes: (r: JSX.Element) => {
        appRoutes.renderedRoutes = r;
      },
      getRenderedRoutes: () => appRoutes.renderedRoutes,
    };

    await (
      new Promise(r => this.hooks.renderRoutes.callAsync(
        {
          setRenderedRoutes: appRoutes.setRenderedRoutes,
          getRenderedRoutes: appRoutes.getRenderedRoutes,
        },
        r,
      )));

    const children = (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <components.appRouter basename={this.options.env.appRootUrl} {...routerParams}>
        {appRoutes.renderedRoutes}
      </components.appRouter>
    );
    const application = {
      children,
      currentRoutes: currentPageRoutes.slice(0),
      routes: routes.slice(0),
    };

    return new Promise((resolve) => {
      this.hooks.beforeRender.callAsync(application, async () => {
        // Render according to routes!
        renderer(
          (
            <ErrorBoundary>
              {application.children}
            </ErrorBoundary>
          ),
          domRootReference,
          () => {
            window.PAW_PRELOADED_DATA = null;
            delete window.PAW_PRELOADED_DATA;
            const preloadedElement = document.getElementById('__pawjs_preloaded');
            if (preloadedElement && preloadedElement.remove) {
              preloadedElement.remove();
            }
            this.hooks.renderComplete.call();
            resolve();
          },
        );
      });
    });
  }

  async run({ routeHandler }: { routeHandler: RouteHandler }) {
    this.routeHandler = routeHandler;
    const { env } = this.options;
    const root = get(env, 'clientRootElementId', 'app');

    if (!document.getElementById(root)) {
      // eslint-disable-next-line
      console.warn(`#${root} element not found in HTML, thus cannot proceed further`);
      return false;
    }
    await this.preloadCurrentRoutes();
    if (!this.options.env.serverSideRender) {
      this.updatePageMeta(this.history.location);
    }
    /**
     * Render application only if loaded
     */
    const idleTimeout = 0;
    const renderOnIdle = (deadline: any) => {
      if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
        this.renderApplication();
      } else {
        if (idleTimeout) {
          window.cancelIdleCallback(idleTimeout);
        }
        window.requestIdleCallback(renderOnIdle);
      }
    };
    window.requestIdleCallback(renderOnIdle);
    return true;
  }
}
