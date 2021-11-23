import invert from 'lodash/invert';
import get from 'lodash/get';
import { Outlet, useNavigationType } from 'react-router';
import { Routes, Route, HashRouter, BrowserRouter } from 'react-router-dom';
import { render, hydrate } from 'react-dom';
import {
  Hook,
  AsyncSeriesHook,
  AsyncParallelBailHook,
  SyncHook,
} from 'tapable';
import { CookiesProvider } from 'react-cookie';
import Cookies from 'universal-cookie';
import RouteHandler from '../router/handler';
import ErrorBoundary from '../components/ErrorBoundary';
import { generateMeta } from '../utils/seo';
import possibleStandardNames from '../utils/reactPossibleStandardNames';
import AbstractPlugin from '../abstract-plugin';
import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { PawProvider } from '../components/Paw';

const possibleHtmlNames = invert(possibleStandardNames);
const getPossibleHtmlName = (key: string): string => possibleHtmlNames[key] || key;

type HistoryLocation = {
  pathname: string;
  search?: string;
  hash?: string;
  key?: string;
  state?: any;
};

export default class ClientHandler extends AbstractPlugin {
  routeHandler: RouteHandler | null = null;

  updatePageMetaTimeout: any = 0;

  loaded = false;

  hooks: {
    beforeRender: AsyncSeriesHook<any>;
    locationChange: AsyncParallelBailHook<any, any>;
    postMetaUpdate: AsyncParallelBailHook<any, any>;
    appStart: AsyncSeriesHook<any>,
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

    this.hooks = {
      locationChange: new AsyncParallelBailHook(['location', 'action']),
      appStart: new AsyncSeriesHook([]),
      postMetaUpdate: new AsyncParallelBailHook(['location', 'action']),
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
    let pathname = location.pathname;
    if (this.useHashRouter() && location.hash) {
      pathname = location.hash.replace('#', '') || location.pathname;
    }
    return RouteHandler.matchRoutes(
      routes,
      pathname.replace(
        this.options.env.appRootUrl,
        '',
      ),
    );
  }

  manageHistoryChange(location: HistoryLocation, action: string) {
    if (!this.loaded) return;
    this.hooks.locationChange.callAsync(location, action, () => null);
    if (this.routeHandler) {
      this.updatePageMeta(location, action)
        .catch((e) => {
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
    if (!metaTitle) {
      return appName;
    }
    return `${metaTitle} ${titleSeparator} ${appName}`;
  }

  async updatePageMeta(location: HistoryLocation, action = '') {
    const updatePageMetaOnIdle = async (deadline: any) => {
      if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
        if (this.routeHandler === null) return false;
        const currentRoutes = this.getCurrentRoutes(location);
        const promises: Promise<any> [] = [];

        try {
          let seoData = {};
          const pwaSchema = this.routeHandler.getPwaSchema();
          const seoSchema = this.routeHandler.getDefaultSeoSchema();
          currentRoutes.forEach((match) => {
            const { route, params } = match as any;
            if (route?.element?.preload) {
              promises.push(route.element.preload(undefined, {
                match: { params },
              })?.promise);
            }
          });
          await Promise.all(promises);
          currentRoutes.forEach((match) => {
            const { route } = match as any;
            let routeSeo = {};
            if (route.getRouteSeo) {
              routeSeo = route.getRouteSeo();
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
          if (action) {
            this.hooks.postMetaUpdate.callAsync(location, action, () => null);
          }
        } catch (ex) {
          console.error('ERR:: Unhandled error in load data', ex);
        }

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
    const isSafari = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);
    const disableInSafari = !this.options.env.safariServiceWorker;
    let registerServiceWorker = this.options.env.serviceWorker;
    if (disableInSafari && isSafari) {
      registerServiceWorker = false;
    }
    if (registerServiceWorker) {
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
    setParams('getCookies', () => new Cookies());
    const getSearchParams = (): URLSearchParams => {
      let searchParams;
      try {
        searchParams = new URLSearchParams(window.location.search);
      } catch (ex) {
        searchParams = new URLSearchParams('');
      }
      return searchParams;
    };
    setParams('getSearchParams', getSearchParams);

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
      const preloadedData = window.PAW_PRELOADED_DATA;
      currentPageRoutes.forEach((match, i: number) => {
        const { route, params } = match as any;
        if (
          (typeof preloadedData[i] !== 'undefined')
          && route && route.element && route.element.preload
        ) {
          const preloadInit = route.element.preload(preloadedData[i], {
            match: { params },
          });
          promises.push(preloadInit.promise);
        } else if (route && route.element && route.element.preload) {
          const preloadInit = route.element.preload(undefined, {
            match: { params },
          });
          promises.push(preloadInit.promise);
        }
      });
    } else {
      currentPageRoutes.forEach((match) => {
        const { route, params } = match as any;
        if (route && route.element && route.element.preload) {
          const preloadInit = route.element.preload(undefined, {
            match: { params },
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
    components.appRouter = this.useHashRouter() ? HashRouter : BrowserRouter;
    const renderRoutes = (rRoutes: any, level = 0) => {
      return rRoutes.map((r: any, index: number) => {
        const { element: ElementComponent, ...others } = r;
        if (!r.children) {
          return (
            <Route element={<ElementComponent />} key={`${level}_${index}`} {...others} />
          );
        }
        return (
          <Route element={<ElementComponent />} key={`${level}_${index}`} {...others}>
            {renderRoutes(r.children, level + 1)}
          </Route>
        );
      });
    };

    const NavigationListner: React.FC = ({ children }) => {
      const navigationType = useNavigationType();
      const location = useLocation();
      const isFirstLoad = useRef(true);
      useLayoutEffect(
        () => {
          if (!isFirstLoad.current) {
            this.manageHistoryChange(location, navigationType);
          }
          isFirstLoad.current = false;
        },
        [navigationType, location],
      );
      return <>{ children }</>;
    };

    const appRoutes = {
      renderedRoutes: (
        <NavigationListner>
          <Routes>
            {renderRoutes(routes)}
          </Routes>
          <Outlet />
        </NavigationListner>
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

    const application = {
      children: appRoutes.renderedRoutes,
      currentRoutes: currentPageRoutes.slice(0),
      routes: routes.slice(0),
    };

    return new Promise((resolve) => {
      this.hooks.beforeRender.callAsync(application, async () => {
        // Render according to routes!
        renderer(
          (
            <CookiesProvider>
              <components.appRouter
                basename={this?.options?.env?.appRootUrl}
              >
                <PawProvider>
                  <ErrorBoundary
                    ErrorComponent={this?.routeHandler?.getErrorComponent()}
                    NotFoundComponent={this?.routeHandler?.get404Component()}
                  >
                    {application.children}
                  </ErrorBoundary>
                </PawProvider>
              </components.appRouter>
            </CookiesProvider>
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
            resolve(null);
          },
        );
      });
    });
  }

  async run({ routeHandler }: { routeHandler: RouteHandler }) {
    this.routeHandler = routeHandler;
    // On app start
    await new Promise(r => this
      .hooks
      .appStart
      .callAsync(
        r,
      ));
    const { env } = this.options;
    const root = get(env, 'clientRootElementId', 'app');

    if (!document.getElementById(root)) {
      // eslint-disable-next-line
      console.warn(`#${root} element not found in HTML, thus cannot proceed further`);
      return false;
    }
    await this.preloadCurrentRoutes();
    if (!this.options.env.serverSideRender) {
      this.updatePageMeta(window.location);
    }
    /**
     * Render application only if loaded
     */
    const idleTimeout = 0;
    const renderOnIdle = (deadline: any) => {
      if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
        this.renderApplication();
        this.loaded = true;
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
